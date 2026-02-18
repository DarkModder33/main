/**
 * Image Generation Interface for TradeHax
 * Placeholder for Hugging Face image generation
 */

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  style?: "trading" | "nft" | "hero" | "general";
  width?: number;
  height?: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
}

/**
 * Generate image via API
 * Implementation handles Hugging Face textToImage on backend
 */
export async function generateImage(
  request: ImageGenerationRequest,
): Promise<GeneratedImage> {
  const response = await fetch("/api/ai/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate trading chart
 */
export async function generateTradingChart(
  symbol: string,
  price: number,
  trend: "bullish" | "bearish",
): Promise<GeneratedImage> {
  return generateImage({
    prompt: `Professional crypto trading chart for ${symbol} at $${price} showing ${trend} trend. Candlesticks, volume bars, grid. Professional quality.`,
    style: "trading",
    width: 1024,
    height: 768,
  });
}

/**
 * Generate NFT artwork
 */
export async function generateNFT(concept: string): Promise<GeneratedImage> {
  return generateImage({
    prompt: `Unique NFT artwork: ${concept}. 3D rendered, vibrant colors, futuristic. Digital collectible.`,
    style: "nft",
    width: 1024,
    height: 1024,
  });
}

/**
 * Generate hero image
 */
export async function generateHeroImage(title: string): Promise<GeneratedImage> {
  return generateImage({
    prompt: `Modern hero banner for "${title}". Neon green/cyan, dark theme, tech aesthetic. No text.`,
    style: "hero",
    width: 1920,
    height: 1080,
  });
}
