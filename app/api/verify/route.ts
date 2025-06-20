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

    // Check if it's an X (Twitter) URL first
    const isXUrl = url.includes('twitter.com') || url.includes('x.com');
    
    if (isXUrl) {
      console.log('Detected X (Twitter) URL');
      return NextResponse.json({ 
        isX: true, 
        isSocialMedia: false, 
        isGeneral: false 
      });
    }

    // Create a prompt for the LLM to verify if the URL is from a social media platform (excluding X)
    const prompt = `Using this metadata provided, identify if this URL belongs to a social media platform. Social media platforms include Instagram, Facebook, Snapchat, Youtube, Tiktok, Reddit, WhatsApp, LinkedIn, Pinterest, and similar platforms. Do NOT include X (Twitter) as it's handled separately. Only respond with "yes" or "no" in lowercase letters.

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

    return NextResponse.json({ 
      isX: false, 
      isSocialMedia: isSocialMedia, 
      isGeneral: !isSocialMedia 
    })
  } catch (error) {
    console.error("Error verifying URL:", error)
    return NextResponse.json({ error: "Failed to verify URL" }, { status: 500 })
  }
}