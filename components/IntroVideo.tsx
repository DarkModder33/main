'use client';

import { useEffect, useRef } from 'react';

interface IntroVideoProps {
  onComplete: () => void;
}

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play the video
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video autoplay failed:', error);
        // If autoplay fails, complete immediately
        onComplete();
      });
    }
  }, [onComplete]);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onEnded={handleVideoEnd}
        playsInline
        muted
      >
        <source src="/videos/intro-video.mp4" type="video/mp4" />
        Your browser does not support the video tag. Please upgrade your browser to view the intro video.
      </video>
      
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 px-6 py-3 bg-gray-900/80 hover:bg-gray-800/90 text-white rounded-lg backdrop-blur-sm transition-all border border-gray-700 hover:border-gray-600 text-sm font-medium"
        aria-label="Skip intro video"
      >
        Skip Intro →
      </button>
    </div>
  );
}
