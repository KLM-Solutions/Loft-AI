import { NextResponse } from "next/server"
import { neon } from '@neondatabase/serverless';
import { currentUser } from '@clerk/nextjs/server';

const sql = neon(process.env.DATABASE_URL || 'postgresql://loft-bookmark_owner:npg_U3kjcvQ1SVdy@ep-flat-bread-a5q8218o-pooler.us-east-2.aws.neon.tech/loft-bookmark?sslmode=require');
export const maxDuration = 300;
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;
    const bookmarks = await sql`
      SELECT id, title, summary, tags, collections, created_at, image, url
      FROM bookmark
      WHERE clerk_username = ${clerk_username}
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ success: true, data: bookmarks });
  } catch (error) {
    console.error("Error processing library request:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch bookmarks" }, { status: 500 })
  }
}
