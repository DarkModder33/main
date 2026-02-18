"use client";

import { Sparkles, Wand2, RotateCw } from "lucide-react";
import { useState } from "react";

interface GeneratedImageResult {
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
}

export function ImageGeneratorComponent() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<"trading" | "nft" | "hero" | "general">(
    "general",
  );
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImageResult | null>(null);
  const [error, setError] = useState("");

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          width: style === "hero" ? 1920 : 1024,
          height: style === "hero" ? 1080 : 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Simulate image generation (placeholder)
      const placeholderImage: GeneratedImageResult = {
        url: `https://via.placeholder.com/${style === "hero" ? "1920x1080" : "1024x1024"}?text=${encodeURIComponent(prompt)}`,
        prompt,
        style,
        timestamp: Date.now(),
      };

      setGeneratedImage(placeholderImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-panel p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
          <Wand2 className="w-6 h-6" />
          Image Generator
        </h2>

        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Describe your image
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Professional crypto trading chart showing bullish trend..."
              rows={4}
              disabled={loading}
              className="w-full rounded border border-cyan-500/30 bg-black/40 px-4 py-3 text-cyan-100 placeholder-cyan-200/40 outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Image Style
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                ["general", "trading", "nft", "hero"] as const
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  disabled={loading}
                  className={`px-3 py-2 rounded text-xs font-bold uppercase transition ${
                    style === s
                      ? "bg-cyan-600 text-white"
                      : "bg-cyan-600/20 text-cyan-200 hover:bg-cyan-600/40"
                  } disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || loading}
            className="theme-cta theme-cta--loud w-full px-6 py-3 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Image
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="rounded border border-red-500/30 bg-red-600/20 px-4 py-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="rounded border border-cyan-500/30 overflow-hidden bg-black/40">
                <img
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  className="w-full h-auto"
                />
              </div>
              <div className="text-xs text-cyan-200/70">
                <p>
                  <strong>Prompt:</strong> {generatedImage.prompt}
                </p>
                <p>
                  <strong>Style:</strong> {generatedImage.style}
                </p>
              </div>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = generatedImage.url;
                  link.download = `tradehax-${generatedImage.style}-${Date.now()}.png`;
                  link.click();
                }}
                className="theme-cta theme-cta--secondary w-full py-2 text-sm"
              >
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-cyan-200/60 space-y-1 border-t border-cyan-500/20 pt-4">
        <p>💡 Supports:</p>
        <p>• Trading charts and visualizations</p>
        <p>• NFT artwork generation</p>
        <p>• Hero images for websites</p>
        <p>• General creative images</p>
      </div>
    </div>
  );
}
