'use client';

import { useState, useEffect } from 'react';
import { IntroVideo } from './IntroVideo';

export function IntroVideoWrapper({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Check if intro has been shown in this session
    const introShown = sessionStorage.getItem('introVideoShown');
    if (!introShown) {
      setShowIntro(true);
    } else {
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introVideoShown', 'true');
    setShowIntro(false);
    setIntroComplete(true);
  };

  if (showIntro && !introComplete) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return <>{children}</>;
}
