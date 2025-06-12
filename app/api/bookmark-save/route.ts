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
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;
    const { title, summary, url, image, tags, collections } = await request.json();

    if (!title || !summary) {
      return NextResponse.json(
        { error: 'Title and summary are required' },
        { status: 400 }
      );
    }

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS bookmark (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        url TEXT,
        image TEXT,
        tags JSONB DEFAULT '[]',
        collections JSONB DEFAULT '[]',
        embedding_title FLOAT[],
        embedding_summary FLOAT[],
        clerk_username TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Generate separate embeddings for title and summary
    const [titleEmbedding, summaryEmbedding] = await Promise.all([
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: title,
      }),
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: summary,
      })
    ]);

    // Insert the bookmark into the database
    const result = await sql`
      INSERT INTO bookmark (
        title, 
        summary,
        url,
        image,
        tags, 
        collections, 
        embedding_title, 
        embedding_summary,
        clerk_username
      )
      VALUES (
        ${title}, 
        ${summary},
        ${url},
        ${image},
        ${JSON.stringify(tags)}, 
        ${JSON.stringify(collections)}, 
        ${titleEmbedding.data[0].embedding},
        ${summaryEmbedding.data[0].embedding},
        ${clerk_username}
      )
      RETURNING id;
    `;

    return NextResponse.json({
      success: true,
      bookmarkId: result[0].id
    });

  } catch (error) {
    console.error('Error saving bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to save bookmark' },
      { status: 500 }
    );
  }
} 