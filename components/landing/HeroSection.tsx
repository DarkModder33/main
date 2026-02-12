"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);

    // Simple canvas animation for trading chart visualization
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Animated line chart simulation
    let animationFrame: number;
    let points: Array<{x: number, y: number}> = [];
    const numPoints = 50;
    let offset = 0;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      // Generate smooth wave pattern
      points = [];
      for (let i = 0; i < numPoints; i++) {
        const x = (i / numPoints) * width;
        const wave1 = Math.sin((i + offset) * 0.1) * 30;
        const wave2 = Math.sin((i + offset) * 0.05) * 50;
        const y = height / 2 + wave1 + wave2;
        points.push({ x, y });
      }

      // Draw gradient line
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 255, 65, 0.8)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Draw glow area under line
      const areaGradient = ctx.createLinearGradient(0, height/2 - 100, 0, height);
      areaGradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
      areaGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

      ctx.fillStyle = areaGradient;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      offset += 0.5;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-tesla-gray-darker/80 to-black"></div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>

      {/* Floating orbs with neon colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tesla-neon-blue/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-tesla-neon-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-tesla-neon-cyan/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full glass-morphism border border-white/20 text-white text-sm font-medium backdrop-blur-xl hover:border-tesla-neon-blue/50 transition-all">
          <TrendingUp className="w-4 h-4 text-tesla-neon-blue" />
          <span>AI-Powered Trading on Solana</span>
          <Sparkles className="w-4 h-4 text-tesla-neon-cyan animate-pulse" />
        </div>

        {/* Main heading with Tesla-style minimalism */}
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight">
          <span className="block bg-gradient-to-r from-white via-white to-gray-300 text-transparent bg-clip-text">
            TradeHax AI
          </span>
        </h1>

        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white/90">
          Trade Smarter with{" "}
          <span className="tesla-gradient-text">AI + Web3</span>
        </h2>

        <p className="text-lg md:text-xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join 10,000+ traders earning passive income with advanced automated trading strategies
          powered by Solana blockchain and cutting-edge AI technology.
        </p>

        {/* CTA Buttons - Tesla style */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="relative bg-white text-black px-10 py-7 text-base font-semibold rounded-lg hover:bg-white/90 transition-all shadow-2xl hover:shadow-white/20 border-0 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Trading Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>

          <Link href="/game">
            <Button
              size="lg"
              variant="outline"
              className="glass-morphism border-white/30 text-white hover:bg-white/10 backdrop-blur-xl px-10 py-7 text-base font-semibold rounded-lg group transition-all"
            >
              <Play className="mr-2 w-5 h-5" />
              Explore Hyperborea
            </Button>
          </Link>
        </div>

        {/* Stats - Tesla minimalist style */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="tesla-card p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-tesla-neon-blue to-tesla-neon-cyan text-transparent bg-clip-text mb-2">
              10,000+
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wider">Active Traders</div>
          </div>
          <div className="tesla-card p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-tesla-neon-purple to-tesla-neon-blue text-transparent bg-clip-text mb-2">
              $1M+
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wider">Trading Volume</div>
          </div>
          <div className="tesla-card p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-tesla-neon-green to-tesla-neon-cyan text-transparent bg-clip-text mb-2">
              99.9%
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wider">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
