import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import OpenAI from 'openai';
import { currentUser } from '@clerk/nextjs/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL || 'postgresql://loft-bookmark_owner:npg_U3kjcvQ1SVdy@ep-flat-bread-a5q8218o-pooler.us-east-2.aws.neon.tech/loft-bookmark?sslmode=require');

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Step 1: Rewrite the query using GPT-4
    const rewriteResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that rewrites user queries to be more specific and search-friendly. Keep the core intent but make it more precise for semantic search."
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7,
    });

    const rewrittenQuery = rewriteResponse.choices[0].message.content || query;

    // Step 2: Generate embedding for the rewritten query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: rewrittenQuery,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 3: Enable pgvector extension and search for relevant bookmarks
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

    // Step 4: Search for relevant content using pgvector, filtered by user
    const searchResults = await sql`
      WITH query_embedding AS (
        SELECT (${queryEmbedding}::float[])::vector as embedding
      ),
      similarity_scores AS (
        -- Bookmarks
        SELECT 
          'bookmark' as type,
          title,
          summary,
          tags,
          collections,
          created_at,
          url,
          image,
          1 - (embedding_title::vector <=> (SELECT embedding FROM query_embedding)) as title_similarity,
          1 - (embedding_summary::vector <=> (SELECT embedding FROM query_embedding)) as summary_similarity
        FROM bookmark
        WHERE 
          clerk_username = ${clerk_username}
          AND (
            1 - (embedding_title::vector <=> (SELECT embedding FROM query_embedding)) > 0.7
            OR 1 - (embedding_summary::vector <=> (SELECT embedding FROM query_embedding)) > 0.7
          )
        UNION ALL
        -- Uploads
        SELECT 
          'upload' as type,
          title,
          summary,
          tags,
          collections,
          created_at,
          NULL as url,
          image,
          1 - (embedding_title::vector <=> (SELECT embedding FROM query_embedding)) as title_similarity,
          1 - (embedding_summary::vector <=> (SELECT embedding FROM query_embedding)) as summary_similarity
        FROM uploads
        WHERE 
          clerk_username = ${clerk_username}
          AND (
            1 - (embedding_title::vector <=> (SELECT embedding FROM query_embedding)) > 0.7
            OR 1 - (embedding_summary::vector <=> (SELECT embedding FROM query_embedding)) > 0.7
          )
        UNION ALL
        -- Notes
        SELECT 
          'note' as type,
          title,
          summary,
          tags,
          collections,
          created_at,
          NULL as url,
          image,
          1 - (embedding_title::vector <=> (SELECT embedding FROM query_embedding)) as title_similarity,
          1 - (embedding_summary::vector <=> (SELECT embedding FROM query_embedding)) as summary_similarity
        FROM notes
        WHERE 
          clerk_username = ${clerk_username}
          AND (
            1 - (embedding_title::vector <=> (SELECT embedding FROM query_embedding)) > 0.7
            OR 1 - (embedding_summary::vector <=> (SELECT embedding FROM query_embedding)) > 0.7
          )
      )
      SELECT * FROM similarity_scores
      ORDER BY GREATEST(title_similarity, summary_similarity) DESC
      LIMIT 5;
    `;

    // Step 5: Generate response using GPT-4 with the search results
    const context = searchResults.map(result => ({
      type: result.type,
      title: result.title,
      summary: result.summary,
      tags: result.tags,
      collections: result.collections,
      created_at: result.created_at
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that answers questions based on the user's saved content (bookmarks, uploads, and notes). 
          Use the following context to answer the question. If the context doesn't contain relevant information, 
          provide a helpful general response. Format your response in a clear, concise way.
          
          Context:
          ${JSON.stringify(context, null, 2)}`
        },
        {
          role: "user",
          content: query
        }
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        response: response.choices[0].message.content,
        relatedTopics: searchResults
      }
    });

  } catch (error) {
    console.error('Error in run-through:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
