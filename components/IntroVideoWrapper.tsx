'use client';

import { useState, useEffect } from 'react';
import { IntroVideo } from './IntroVideo';

export function IntroVideoWrapper({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Check if intro has been shown in this session
    try {
      const introShown = sessionStorage.getItem('introVideoShown');
      if (!introShown) {
        setShowIntro(true);
      } else {
        setIntroComplete(true);
      }
    } catch (error) {
      // If sessionStorage is not available, skip intro
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('introVideoShown', 'true');
    } catch (error) {
      // If sessionStorage is not available, continue anyway
      console.warn('Unable to save intro state to sessionStorage');
    }
    setShowIntro(false);
    setIntroComplete(true);
  };

  if (showIntro) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return <>{children}</>;
}
