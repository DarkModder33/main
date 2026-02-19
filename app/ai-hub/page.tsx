import { HFChatComponent } from "@/components/ai/HFChatComponent";
import { HFGeneratorComponent } from "@/components/ai/HFGeneratorComponent";
import { ImageGeneratorComponent } from "@/components/ai/ImageGeneratorComponent";
import { SmartEnvironmentMonitor } from "@/components/ai/SmartEnvironmentMonitor";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { createPageMetadata } from "@/lib/seo";
import {
    BarChart3,
    Brain,
    MessageSquare,
    Sparkles,
    Wand2,
    Zap,
} from "lucide-react";

export const metadata = createPageMetadata({
  title: "TradeHax AI Hub - Smart Trading Environment",
  description:
    "Unified AI platform with trading bots, image generation, smart environment context, and intelligent chat.",
  path: "/ai-hub",
  keywords: ["ai trading", "smart environment", "image generation", "ai assistants"],
});

export default function AIHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="theme-badge inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold mb-6">
            <Brain className="w-4 h-4" />
            UNIFIED AI PLATFORM
          </div>

          <h1 className="theme-title text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            TradeHax AI Hub
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your complete AI-powered trading ecosystem with intelligent bots,
            image generation, context-aware advice, and smart portfolio
            management.
          </p>
          <p className="text-sm text-cyan-200/80 max-w-2xl mx-auto">
            Open Mode is enabled by default for direct responses and expressive outputs. Configure
            `TRADEHAX_LLM_OPEN_MODE` and `TRADEHAX_IMAGE_OPEN_MODE` per environment.
          </p>
        </div>

        {/* Smart Environment Monitor */}
        <div className="mb-12">
          <SmartEnvironmentMonitor />
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Generator */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-cyan-300">Image Generator</h2>
            </div>
            <ImageGeneratorComponent />
          </div>

          {/* AI Chat */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-emerald-300">AI Chat</h2>
            </div>
            <HFChatComponent />
          </div>
        </div>

        {/* Additional Tools */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Text Generator */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-yellow-300">Text Generator</h2>
            </div>
            <HFGeneratorComponent />
          </div>

          {/* Capabilities */}
          <div className="theme-panel p-6">
            <h2 className="text-xl font-bold text-white mb-6">Capabilities</h2>
            <div className="space-y-4">
              <CapabilityItem
                icon={<Brain className="w-5 h-5" />}
                title="Smart Environment"
                description="Context-aware system with market data, portfolio tracking, and bot management"
              />
              <CapabilityItem
                icon={<Wand2 className="w-5 h-5" />}
                title="Image Generation"
                description="Create trading charts, NFT artwork, and hero images with AI"
              />
              <CapabilityItem
                icon={<MessageSquare className="w-5 h-5" />}
                title="Intelligent Chat"
                description="Personalized trading advice based on your experience and risk tolerance"
              />
              <CapabilityItem
                icon={<BarChart3 className="w-5 h-5" />}
                title="Portfolio Analytics"
                description="Real-time portfolio monitoring with allocation insights"
              />
              <CapabilityItem
                icon={<Zap className="w-5 h-5" />}
                title="Bot Management"
                description="Create and manage automated trading bots with multiple strategies"
              />
              <CapabilityItem
                icon={<Sparkles className="w-5 h-5" />}
                title="Model Fine-tuning"
                description="Train models on TradeHax datasets for custom predictions"
              />
            </div>
          </div>
        </div>

        {/* Datasets & Models */}
        <div className="theme-panel p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">Datasets & Models</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <DatasetCard
              title="TradeHax Behavioral"
              description="26 Q&A pairs on trading strategies, risk management, and platform features"
              type="Training Dataset"
              entries="26 pairs"
              format="JSONL"
            />
            <DatasetCard
              title="Crypto Education"
              description="10 comprehensive lessons on blockchain, DeFi, trading concepts"
              type="Training Dataset"
              entries="10 pairs"
              format="JSONL"
            />
            <DatasetCard
              title="Trading Strategy"
              description="Expanded with UI generation, NLP, and trading strategy optimization"
              type="Training Dataset"
              entries="20+ pairs"
              format="JSONL"
            />
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Available Models</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ModelCard
                name="Mistral-7B-Instruct"
                type="Text Generation"
                size="7B parameters"
                use="Chat, code, trading analysis"
              />
              <ModelCard
                name="Stable Diffusion 2.1"
                type="Image Generation"
                size="1B+ parameters"
                use="Trading charts, NFT art, UI"
              />
              <ModelCard
                name="Meta-Llama-3-8B-Instruct"
                type="Text Generation"
                size="8B parameters"
                use="Long-form strategy and agent workflows"
              />
              <ModelCard
                name="FLUX.1 Schnell"
                type="Image Generation"
                size="Large diffusion"
                use="High-contrast concept renders"
              />
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="theme-panel theme-panel--success p-8">
          <h2 className="text-2xl font-bold text-emerald-300 mb-6">Getting Started</h2>

          <div className="space-y-4">
            <StepCard
              step="1"
              title="Initialize Environment"
              description="Set up your smart environment with wallet, preferences, and portfolio data"
            />
            <StepCard
              step="2"
              title="Configure AI Models"
              description="Set HF_API_TOKEN, HF_MODEL_ID, and HF_IMAGE_MODEL_ID in .env.local"
            />
            <StepCard
              step="3"
              title="Create Trading Bots"
              description="Define strategies (scalping, swing, long-term) and risk parameters"
            />
            <StepCard
              step="4"
              title="Generate Images"
              description="Use AI to create trading charts, NFT artwork, and marketing materials"
            />
            <StepCard
              step="5"
              title="Chat with AI"
              description="Get personalized trading advice with market context awareness"
            />
            <StepCard
              step="6"
              title="Monitor Performance"
              description="Track bot performance, portfolio allocation, and market signals"
            />
          </div>
        </div>
      </main>

      <ShamrockFooter />
    </div>
  );
}

function CapabilityItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="text-cyan-400 flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function DatasetCard({
  title,
  description,
  type,
  entries,
  format,
}: {
  title: string;
  description: string;
  type: string;
  entries: string;
  format: string;
}) {
  return (
    <div className="border border-emerald-500/30 rounded p-6 bg-emerald-600/5">
      <div className="text-xs font-bold text-emerald-400 mb-2">{type}</div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{entries}</span>
        <span>{format}</span>
      </div>
    </div>
  );
}

function ModelCard({
  name,
  type,
  size,
  use,
}: {
  name: string;
  type: string;
  size: string;
  use: string;
}) {
  return (
    <div className="border border-blue-500/30 rounded p-4 bg-blue-600/5">
      <div className="font-bold text-blue-300 mb-1">{name}</div>
      <div className="text-xs text-gray-500 space-y-1">
        <div>
          <strong>Type:</strong> {type}
        </div>
        <div>
          <strong>Size:</strong> {size}
        </div>
        <div>
          <strong>Use:</strong> {use}
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 pb-4 border-b border-emerald-500/20 last:border-0">
      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white">
        {step}
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-emerald-200/80">{description}</p>
      </div>
    </div>
  );
}
