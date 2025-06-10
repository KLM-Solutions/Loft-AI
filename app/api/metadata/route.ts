import { NextResponse } from 'next/server';
import got from 'got';
import * as cheerio from 'cheerio';

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

    console.log('📥 Fetching webpage content...');
    const { body: html, url: finalUrl } = await got(url);
    console.log('📄 HTML content received, length:', html.length);

    // Load HTML into cheerio
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      // Open Graph tags
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content') || finalUrl,
      site_name: $('meta[property="og:site_name"]').attr('content'),
      type: $('meta[property="og:type"]').attr('content'),

      // Twitter Card tags (fallback)
      twitter_title: $('meta[name="twitter:title"]').attr('content'),
      twitter_description: $('meta[name="twitter:description"]').attr('content'),
      twitter_image: $('meta[name="twitter:image"]').attr('content'),
    };

    console.log('🔍 Extracted metadata:', {
      title: metadata.title,
      description: metadata.description?.substring(0, 100) + '...',
      image: metadata.image,
      url: metadata.url,
      site_name: metadata.site_name,
      type: metadata.type
    });

    return NextResponse.json({
      success: true,
      metadata
    });

  } catch (error) {
    console.error('❌ Error extracting metadata:', error);
    return NextResponse.json(
      { error: 'Failed to extract metadata' },
      { status: 500 }
    );
  }
} 