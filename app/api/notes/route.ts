import { NextResponse } from 'next/server';
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
import { currentUser } from '@clerk/nextjs/server';
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { note } = await request.json();

    if (!note) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    // Generate title and summary using Perplexity AI
    const [titleResponse, summaryResponse] = await Promise.all([
      generateText({
        model: perplexity('sonar'),
        prompt: `Generate a concise, engaging title (max 3 words) for this note: ${note}, response format should be like this : title(text-format not any other format, don't use this type of numbers or sources [1][5]), also don't use "" or '' `,
      }),
      generateText({
        model: perplexity('sonar'),
        prompt: `Provide a small summary (2-3 sentences) of this note: ${note}`,
      })
    ]);

    return NextResponse.json({
      title: titleResponse.text,
      summary: summaryResponse.text
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 