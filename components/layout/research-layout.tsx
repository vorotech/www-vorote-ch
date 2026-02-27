'use client';

import React, { PropsWithChildren, useEffect } from 'react';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export function ResearchLayout({ children }: PropsWithChildren) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

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

        {/* Interactive Grid */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
          <GridPattern
            width={40}
            height={40}
            x={-1}
            y={-1}
            strokeDasharray="4 4"
            className={cn(
              "fill-mocha-text/5 stroke-mocha-text/10",
            )}
          />
        </div>

        {/* Mouse Glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useTransform(
              [springX, springY],
              ([x, y]) => `radial-gradient(circle 400px at ${x}px ${y}px, rgba(203,166,247,0.15), transparent 80%)`
            )
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Progressive Blur for edge softening */}
      <ProgressiveBlur 
        className="fixed bottom-0 left-0 right-0 h-24 z-20 pointer-events-none" 
        direction="top" 
        blurLayers={6} 
        blurIntensity={0.5}
      />
    </div>
  );
}
