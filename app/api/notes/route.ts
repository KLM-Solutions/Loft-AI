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
        prompt: `Generate a short and descriptive title for the following note: ${note}.
Use 3 words or fewer.
Avoid vague labels like "Note" or "Thought".
Focus on the theme or topic of the note.`,
      }),
      generateText({
        model: perplexity('sonar'),
        prompt: `Write a brief summary (2–3 sentences) of the following note: ${note}.
Highlight the core idea or insight.
Be clear and neutral in tone.
Avoid repeating the exact wording of the note.`,
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