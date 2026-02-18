/**
 * POST /api/ai/generate-image
 * Generate images with Stable Diffusion
 */

import { NextRequest, NextResponse } from "next/server";

interface ImageRequest {
  prompt: string;
  negativePrompt?: string;
  style?: "trading" | "nft" | "hero" | "general";
  width?: number;
  height?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // TODO: Import ImageGenerator when client-side safe
    // const { ImageGenerator } = await import("@/lib/ai/image-generator");
    // const generator = new ImageGenerator(process.env.HF_API_TOKEN);

    console.log("[ImageGen API] Generating image:", body.prompt);

    // Placeholder response (actual implementation requires HF API token configured)
    return NextResponse.json({
      ok: true,
      message: "Image generation queued",
      prompt: body.prompt,
      style: body.style || "general",
      status: "processing",
      estimatedTime: "30-60 seconds",
      note: "Configure HF_API_TOKEN in .env.local to enable image generation",
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Image generation failed",
      },
      { status: 500 },
    );
  }
}
