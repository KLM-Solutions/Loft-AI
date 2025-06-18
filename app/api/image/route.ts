import { NextResponse } from 'next/server';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Convert base64 image to buffer
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Analyze the image using Google Gemini
    const { google } = await import('@ai-sdk/google');
    const { generateText } = await import('ai');

    const result = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and provide:\n1. A concise, descriptive title (max 5 words)\n2. A detailed summary explaining what you see in the image (max 3 lines)\n\nFormat your response as:\nTitle: [title]\nSummary: [summary]',
            },
            {
              type: 'file',
              data: imageBuffer,
              mimeType: 'image/jpeg',
            },
          ],
        },
      ],
    });

    const responseText = result.text;
    const titleMatch = responseText.match(/Title:\s*(.+?)(?:\n|$)/);
    const summaryMatch = responseText.match(/Summary:\s*(.+?)(?:\n|$)/);

    const title = titleMatch ? titleMatch[1].trim() : 'Analyzed Image';
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Image analysis completed';
    

    

    return NextResponse.json({
      success: true,
      title,
      summary,
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 