import { NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    console.log('🌐 Processing URL:', url);
    
    if (!url) {
      console.log('❌ No URL provided');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Use open-graph-scraper
    const options = {
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    const { error, result } = await ogs(options);
    if (error) {
      console.error('❌ Error extracting metadata:', result?.error || 'Unknown error');
      return NextResponse.json(
        { error: 'Failed to extract metadata', details: result?.error },
        { status: 500 }
      );
    }

    // Log and return the result
    console.log('🔍 Extracted metadata:', result);
    return NextResponse.json({
      success: true,
      metadata: result
    });
  } catch (error) {
    console.error('❌ Error extracting metadata:', error);
    return NextResponse.json(
      { error: 'Failed to extract metadata' },
      { status: 500 }
    );
  }
} 