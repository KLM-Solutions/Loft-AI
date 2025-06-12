import { NextResponse } from 'next/server';
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    // Generate summary using Perplexity AI
    const summaryResponse = await generateText({
      model: perplexity('sonar'),
      prompt: `Provide a brief summary (2-3 sentences) of the content at this URL: ${url}`,
    });
    return NextResponse.json({ summary: summaryResponse.text });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 