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

    // Fetch counts from all tables in parallel
    const [bookmarksCount, tagsCount, collectionsCount] = await Promise.all([
      // Count bookmarks
      sql`
        SELECT COUNT(*) as count
        FROM bookmark
        WHERE clerk_username = ${clerk_username}
      `,
      // Count tags
      sql`
        SELECT COUNT(*) as count
        FROM my_tags
        WHERE clerk_username = ${clerk_username}
      `,
      // Count collections
      sql`
        SELECT COUNT(*) as count
        FROM my_collections
        WHERE clerk_username = ${clerk_username}
      `
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookmarks: parseInt(bookmarksCount[0]?.count || '0'),
        tags: parseInt(tagsCount[0]?.count || '0'),
        collections: parseInt(collectionsCount[0]?.count || '0')
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 