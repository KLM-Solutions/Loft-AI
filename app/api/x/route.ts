import { NextResponse } from "next/server"
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    console.log('🌐 Raw request body:', body);
    
    let url;
    try {
      const parsed = JSON.parse(body);
      url = parsed.url;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    console.log('🌐 Processing X URL:', url);
    console.log('🌐 URL type:', typeof url);
    console.log('🌐 URL length:', url?.length);

    if (!url) {
      console.log('❌ No URL provided');
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Check if it's a valid X/Twitter URL
    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      console.log('❌ Invalid X/Twitter URL:', url);
      return NextResponse.json({ error: "Invalid X/Twitter URL" }, { status: 400 })
    }

    // Convert x.com URLs to twitter.com for the oEmbed API
    const twitterUrl = url.replace('x.com', 'twitter.com');
    console.log('🔄 Converted URL:', twitterUrl);
    
    // Call Twitter's oEmbed API
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(twitterUrl)}`;
    
    console.log('📡 Calling Twitter oEmbed API:', oembedUrl);
    
    const response = await fetch(oembedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LoftAI/1.0)',
      },
    });
    
    console.log('📊 Twitter API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ Twitter oEmbed API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      return NextResponse.json({ 
        error: "Failed to fetch X content",
        details: `Twitter API returned ${response.status}: ${response.statusText}`,
        responseBody: errorText
      }, { status: 500 })
    }

    const data = await response.json();
    console.log('✅ Twitter oEmbed response received:', {
      author_name: data.author_name,
      html_length: data.html?.length || 0,
      url: data.url
    });

    // Extract relevant information from the oEmbed response
    const title = data.author_name ? `${data.author_name} on X` : 'X Post';
    const summary = data.html ? 
      // Extract text content from HTML, removing HTML tags
      data.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() :
      'X post content';
    
    // Extract image if available (Twitter posts often have images)
    let image = null;
    if (data.html && data.html.includes('pic.twitter.com')) {
      // For now, we'll use a placeholder image for X posts
      // In a production environment, you might want to extract the actual image URL
      image = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxRUE5RjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggMjRjMy4zMTQgMCA2LTIuNjg2IDYtNlY2YzAtMy4zMTQtMi42ODYtNi02LTZINmMtMy4zMTQgMC02IDIuNjg2LTYgNnYxMmMwIDMuMzE0IDIuNjg2IDYgNiA2aDEyWiI+PC9wYXRoPjxwYXRoIGQ9Ik0xMiA2djEyIj48L3BhdGg+PHBhdGggZD0iTTYgMTJoMTIiPjwvcGF0aD48L3N2Zz4=";
    }

    const result = {
      success: true,
      title,
      summary,
      image,
      author: data.author_name,
      authorUrl: data.author_url,
      originalUrl: url,
      provider: 'X (Twitter)',
      oembedData: data
    };

    console.log('✅ Returning X data:', {
      title: result.title,
      summary_length: result.summary.length,
      has_image: !!result.image
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Error processing X URL:", error)
    return NextResponse.json({ 
      error: "Failed to process X URL",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 