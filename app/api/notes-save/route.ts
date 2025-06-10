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
    const { title, summary, note, tags, collections, image } = await request.json();

    if (!title || !summary || !note) {
      return NextResponse.json(
        { error: 'Title, summary, and note content are required' },
        { status: 400 }
      );
    }

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        note TEXT NOT NULL,
        image TEXT DEFAULT 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjI4RjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4=',
        tags JSONB DEFAULT '[]',
        collections JSONB DEFAULT '[]',
        embedding_title FLOAT[],
        embedding_summary FLOAT[],
        embedding_note FLOAT[],
        clerk_username TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Generate embeddings for title, summary, and note
    const [titleEmbedding, summaryEmbedding, noteEmbedding] = await Promise.all([
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: title,
      }),
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: summary,
      }),
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: note,
      })
    ]);

    // Insert the note into the database
    const result = await sql`
      INSERT INTO notes (
        title, 
        summary,
        note,
        image,
        tags, 
        collections, 
        embedding_title, 
        embedding_summary,
        embedding_note,
        clerk_username
      )
      VALUES (
        ${title}, 
        ${summary},
        ${note},
        ${image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjI4RjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUtdGV4dCI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjxsaW5lIHgxPSIxNiIgeTE9IjEzIiB4Mj0iOCIgeTI9IjEzIj48L2xpbmU+PGxpbmUgeDE9IjE2IiB5MT0iMTciIHgyPSI4IiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTAiIHkxPSI5IiB4Mj0iOCIgeTI9IjkiPjwvbGluZT48L3N2Zz4='},
        ${JSON.stringify(tags)}, 
        ${JSON.stringify(collections)}, 
        ${titleEmbedding.data[0].embedding},
        ${summaryEmbedding.data[0].embedding},
        ${noteEmbedding.data[0].embedding},
        ${clerk_username}
      )
      RETURNING id;
    `;

    return NextResponse.json({
      success: true,
      noteId: result[0].id
    });

  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
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
    const notes = await sql`
      SELECT id, title, summary, note, tags, collections, created_at, image
      FROM notes
      WHERE clerk_username = ${clerk_username}
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error("Error processing notes request:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch notes" }, { status: 500 })
  }
} 