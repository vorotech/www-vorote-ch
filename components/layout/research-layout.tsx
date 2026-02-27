'use client';

import React, { PropsWithChildren } from 'react';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { cn } from '@/lib/utils';

export function ResearchLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen bg-mocha-base text-mocha-text selection:bg-mocha-mauve/30 selection:text-mocha-mauve overflow-hidden">
      {/* Background Blooms */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-mocha-mauve/10 blur-[120px]" 
        />
        <div 
          className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] rounded-full bg-mocha-blue/10 blur-[120px]" 
        />
        <div 
          className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-mocha-teal/5 blur-[120px]" 
        />
        
        {/* Ambient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mocha-mantle/20 to-mocha-crust/40" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Progressive Blur for edge softening if needed, or just as a decorative element */}
      <ProgressiveBlur 
        className="fixed bottom-0 left-0 right-0 h-24 z-20 pointer-events-none" 
        direction="top" 
        blurLayers={6}
        blurIntensity={0.5}
      />
    </div>
  );
}
