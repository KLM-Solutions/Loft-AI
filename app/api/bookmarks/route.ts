import { NextResponse } from 'next/server';
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
import { neon } from '@neondatabase/serverless';
import { currentUser } from '@clerk/nextjs/server';

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
    const { url, searchQuery, xTitle, xSummary } = await request.json();

    // If it's a search query, save it to the database
    if (searchQuery) {
      // Create search table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS search (
          id SERIAL PRIMARY KEY,
          query TEXT NOT NULL,
          clerk_username TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Save the search query
      await sql`
        INSERT INTO search (query, clerk_username)
        VALUES (${searchQuery}, ${clerk_username})
      `;

      return NextResponse.json({ success: true });
    }

    // Handle bookmark processing
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // If X data is provided, process it with AI
    if (xTitle && xSummary) {
      console.log('Processing X data with AI:', { xTitle, xSummary });
      
      const [titleResponse, summaryResponse] = await Promise.all([
        generateText({
          model: perplexity('sonar'),
          prompt: `Improve and enhance this X (Twitter) post title to make it more engaging and descriptive (max 5 words): "${xTitle}". Response format should be like this: title(text-format not any other format, don't use this type of numbers or sources [1][5]), also don't use "" or '' or any other format, just text`,
        }),
        generateText({
          model: perplexity('sonar'),
          prompt: `Improve and enhance this X (Twitter) post summary to make it more comprehensive and engaging (2-3 sentences): "${xSummary}"`,
        })
      ]);

      return NextResponse.json({
        title: titleResponse.text,
        summary: summaryResponse.text
      });
    }

    // Generate title and summary using Perplexity AI for general URLs
    const [titleResponse, summaryResponse] = await Promise.all([
      generateText({
        model: perplexity('sonar'),
        prompt: `Generate a concise, engaging title (max 5 words) for this URL: ${url}, response format should be like this : title(text-format not any other format, don't use this type of numbers or sources [1][5]), also don't use "" or '' or any other format, just text`,
      }),
      generateText({
        model: perplexity('sonar'),
        prompt: `Provide a brief summary (2-3 sentences) of the content at this URL: ${url}`,
      })
    ]);

    return NextResponse.json({
      title: titleResponse.text,
      summary: summaryResponse.text
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'saved-searches') {
      // Fetch saved searches for the current user only
      const searches = await sql`
        SELECT id, query, created_at
        FROM search
        WHERE clerk_username = ${clerk_username}
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return NextResponse.json({ success: true, data: searches });
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    );
  }
}

export async function POST_summary(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    // Generate summary using Perplexity AI
    const summaryResponse = await generateText({
      model: perplexity('sonar'),
      prompt: `Provide a brief summary (2-3 sentences) of the content at this URL: ${url}`,
    });
    return NextResponse.json({ summary: summaryResponse.text });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
