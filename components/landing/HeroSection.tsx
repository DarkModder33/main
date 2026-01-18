"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Check if video should be shown (not on slow connections)
    const nav = navigator as unknown as { 
      connection?: { effectiveType?: string }; 
      mozConnection?: { effectiveType?: string }; 
      webkitConnection?: { effectiveType?: string }; 
    };
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const shouldShowVideo = !connection || connection.effectiveType !== 'slow-2g';
    setShowVideo(shouldShowVideo);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background (optional - loads only if video file exists) */}
      {showVideo && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-30' : 'opacity-0'
            }`}
            poster="/images/hero-fallback.jpg"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
            <source src="/videos/hero-background.webm" type="video/webm" />
          </video>
          {/* Video overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950"></div>
        </>
      )}
      
      {/* Fallback gradient background */}
      {(!showVideo || !videoLoaded) && (
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/20 to-black"></div>
      )}
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Solana Blockchain</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 text-transparent bg-clip-text animate-gradient">
          TradeHax AI
        </h1>
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-100 drop-shadow-lg">
          Trade Smarter with AI + Web3
        </h2>

        <p className="text-xl md:text-2xl text-green-300 mb-12 max-w-3xl mx-auto drop-shadow-md">
          Join 10,000+ traders earning passive income with advanced automated trading strategies
          powered by Solana blockchain and AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-black px-8 py-6 text-lg group shadow-lg hover:shadow-green-500/50"
            >
              Start Trading (Free)
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Link href="/game">
            <Button
              size="lg"
              variant="outline"
              className="border-green-700 text-green-300 hover:bg-green-900/50 backdrop-blur-sm px-8 py-6 text-lg group"
            >
              <Play className="mr-2 w-5 h-5" />
              Play Hyperborea
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="text-2xl">★★★★★</span>
            <span className="text-green-100 font-semibold">4.9/5</span>
          </div>
          <p className="text-gray-400 text-sm">
            from 1,247 reviews | 🔒 Secured by Solana
          </p>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center backdrop-blur-sm bg-gray-900/30 rounded-lg p-6 border border-green-800/50">
            <div className="text-3xl font-bold text-green-100 mb-2">10,000+</div>
            <div className="text-gray-400">Active Traders</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-gray-900/30 rounded-lg p-6 border border-green-800/50">
            <div className="text-3xl font-bold text-green-100 mb-2">$1M+</div>
            <div className="text-gray-400">Trading Volume</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-gray-900/30 rounded-lg p-6 border border-green-800/50">
            <div className="text-3xl font-bold text-green-100 mb-2">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
