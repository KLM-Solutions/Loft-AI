import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { currentUser } from '@clerk/nextjs/server';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL || 'postgresql://loft-bookmark_owner:npg_U3kjcvQ1SVdy@ep-flat-bread-a5q8218o-pooler.us-east-2.aws.neon.tech/loft-bookmark?sslmode=require');

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;
    const { interests } = await request.json();

    if (!interests || !Array.isArray(interests)) {
      return NextResponse.json(
        { error: 'Interests array is required' },
        { status: 400 }
      );
    }

    // Create interests table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_interests (
        id SERIAL PRIMARY KEY,
        clerk_username TEXT NOT NULL UNIQUE,
        interests TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert or update interests for this user
    await sql`
      INSERT INTO user_interests (clerk_username, interests)
      VALUES (${clerk_username}, ${interests}::TEXT[])
      ON CONFLICT (clerk_username) 
      DO UPDATE SET 
        interests = ${interests}::TEXT[],
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving interests:', error);
    return NextResponse.json(
      { error: 'Failed to save interests' },
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

    // Get user's interests
    const result = await sql`
      SELECT interests
      FROM user_interests
      WHERE clerk_username = ${clerk_username}
    `;

    const userInterests = result[0]?.interests || [];
    const hasInterests = userInterests.length > 0;

    return NextResponse.json({ 
      success: true, 
      data: userInterests,
      hasInterests,
      username: clerk_username
    });
  } catch (error) {
    console.error('Error fetching interests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interests' },
      { status: 500 }
    );
  }
} 