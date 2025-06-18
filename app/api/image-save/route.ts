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
    const { title, summary, image, tags, collections } = await request.json();

    if (!title || !summary || !image) {
      return NextResponse.json(
        { error: 'Title, summary, and image are required' },
        { status: 400 }
      );
    }

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        image TEXT NOT NULL,
        tags JSONB DEFAULT '[]',
        collections JSONB DEFAULT '[]',
        embedding_title FLOAT[],
        embedding_summary FLOAT[],
        clerk_username TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Generate embeddings for title and summary
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

    // Insert the image into the database
    const result = await sql`
      INSERT INTO images (
        title, 
        summary,
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
      imageId: result[0].id
    });

  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;
    const images = await sql`
      SELECT id, title, summary, image, tags, collections, created_at
      FROM images
      WHERE clerk_username = ${clerk_username}
      ORDER BY created_at DESC
    `;
    // Add contentType and unique id prefix
    const processedImages = images.map((image: any) => ({
      ...image,
      id: `image_${image.id}`,
      contentType: 'image',
    }));
    return NextResponse.json({ success: true, data: processedImages });
  } catch (error) {
    console.error("Error processing images request:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch images" }, { status: 500 })
  }
} 