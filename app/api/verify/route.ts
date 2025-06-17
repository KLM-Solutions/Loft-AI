import { NextResponse } from "next/server"
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const { url, metadata } = await request.json()
    console.log('Verifying URL:', url);
    console.log('Received metadata:', metadata);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Create a prompt for the LLM to verify if the URL is from a social media platform
    const prompt = `Using this metadata provided, identify which social media platform this belongs to. Social media platforms are platforms like Instagram, X, Facebook, Snapchat, Youtube, Tiktok, Reddit, WhatsApp, and more. Only respond with "yes" or "no" in lowercase letters.

Metadata:
${JSON.stringify(metadata, null, 2)}`

    console.log('Sending prompt to Perplexity:', prompt);

    const response = await generateText({
      model: perplexity('sonar'),
      prompt: prompt,
    });

    console.log('Perplexity response:', response.text);

    const isSocialMedia = response.text.trim().toLowerCase() === "yes"
    console.log('Is social media:', isSocialMedia);

    return NextResponse.json({ isSocialMedia })
  } catch (error) {
    console.error("Error verifying URL:", error)
    return NextResponse.json({ error: "Failed to verify URL" }, { status: 500 })
  }
}