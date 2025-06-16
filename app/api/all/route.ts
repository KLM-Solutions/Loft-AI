import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { currentUser } from '@clerk/nextjs/server';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL || 'postgresql://loft-bookmark_owner:npg_U3kjcvQ1SVdy@ep-flat-bread-a5q8218o-pooler.us-east-2.aws.neon.tech/loft-bookmark?sslmode=require');

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;

    // Fetch data from all three tables in parallel
    const [bookmarks, notes] = await Promise.all([
      // Fetch bookmarks
      sql`
        SELECT 
          id,
          title,
          summary,
          tags,
          collections,
          created_at,
          image,
          url,
          'bookmark' as type
        FROM bookmark
        WHERE clerk_username = ${clerk_username}
      `,
      // Fetch notes
      sql`
        SELECT 
          id,
          title,
          summary,
          tags,
          collections,
          created_at,
          image,
          note as content,
          'note' as type
        FROM notes
        WHERE clerk_username = ${clerk_username}
      `
    ]);

    // Combine all data
    const allData = [
      ...bookmarks,
      ...notes
    ];

    // Sort by created_at in descending order
    allData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ 
      success: true, 
      data: allData 
    });

  } catch (error) {
    console.error("Error processing all content request:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch all content" 
    }, { 
      status: 500 
    });
  }
} 