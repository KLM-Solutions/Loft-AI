import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { currentUser } from '@clerk/nextjs/server';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL || 'postgresql://loft-bookmark_owner:npg_U3kjcvQ1SVdy@ep-flat-bread-a5q8218o-pooler.us-east-2.aws.neon.tech/loft-bookmark?sslmode=require');

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerk_username = user.username || user.emailAddresses?.[0]?.emailAddress || user.id;
    const prefixedId = params.id;

    if (!prefixedId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
    }

    // Parse the prefixed ID to get content type and actual ID
    const idParts = prefixedId.split('_');
    if (idParts.length !== 2) {
      return NextResponse.json({ error: 'Invalid bookmark ID format' }, { status: 400 });
    }

    const contentType = idParts[0]; // 'link', 'note', or 'image'
    const actualId = idParts[1]; // The actual database ID

    // Determine the table name based on content type
    let tableName: string;
    switch (contentType) {
      case 'link':
        tableName = 'bookmark';
        break;
      case 'note':
        tableName = 'notes';
        break;
      case 'image':
        tableName = 'images';
        break;
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // First, check if the item exists and belongs to the user
    let existingItem: any[] = [];
    if (tableName === 'bookmark') {
      existingItem = await sql`
        SELECT id FROM bookmark
        WHERE id = ${actualId} AND clerk_username = ${clerk_username}
      `;
    } else if (tableName === 'notes') {
      existingItem = await sql`
        SELECT id FROM notes
        WHERE id = ${actualId} AND clerk_username = ${clerk_username}
      `;
    } else if (tableName === 'images') {
      existingItem = await sql`
        SELECT id FROM images
        WHERE id = ${actualId} AND clerk_username = ${clerk_username}
      `;
    }

    if (existingItem.length === 0) {
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }

    // Delete the item from the database
    if (tableName === 'bookmark') {
      await sql`
        DELETE FROM bookmark
        WHERE id = ${actualId} AND clerk_username = ${clerk_username}
      `;
    } else if (tableName === 'notes') {
      await sql`
        DELETE FROM notes
        WHERE id = ${actualId} AND clerk_username = ${clerk_username}
      `;
    } else if (tableName === 'images') {
      await sql`
        DELETE FROM images
        WHERE id = ${actualId} AND clerk_username = ${clerk_username}
      `;
    }

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });

  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
} 