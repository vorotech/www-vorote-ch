'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { m, useSpring, type MotionValue } from 'motion/react';

interface JourneyPathProps {
  progress: MotionValue<number>;
  milestoneCount?: number;
}

export const JourneyPath = ({ progress, milestoneCount = 6 }: JourneyPathProps) => {
  const [amplitude, setAmplitude] = useState(25);
  
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setAmplitude(isMobile ? 10 : 30);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pathLength = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const pathData = useMemo(() => {
    if (milestoneCount <= 0) return '';
    if (milestoneCount === 1) return 'M 50 0 L 50 1000';
    
    const height = 1000;
    const step = height / (milestoneCount - 1);
    
    const points = [`M 50 0`];
    
    for (let i = 0; i < milestoneCount - 1; i++) {
      const nextY = (i + 1) * step;
      const isRight = i % 2 === 0;
      const xOffset = isRight ? amplitude : -amplitude;
      
      const cpX = 50 + xOffset;
      const prevY = i * step;
      const cpY1 = prevY + step * 0.3;
      const cpY2 = prevY + step * 0.7;
      
      points.push(`C ${cpX} ${cpY1}, ${cpX} ${cpY2}, 50 ${nextY}`);
    }
    
    return points.join(' ');
  }, [milestoneCount, amplitude]);

  // Generate tick marks for "Architect" aesthetic
  const ticks = useMemo(() => {
    const count = 20;
    return Array.from({ length: count }).map((_, i) => (i * 1000) / (count - 1));
  }, []);

  return (
    <div className='absolute top-0 left-0 w-full h-full pointer-events-none -z-10'>
      <svg
        viewBox='0 0 100 1000'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full overflow-visible'
        preserveAspectRatio='none'
      >
        <title>Journey Path</title>
        
        {/* Architectural Grid / Ticks */}
        {ticks.map((y, i) => (
          <g key={i} className="opacity-20">
            <line x1="48" y1={y} x2="52" y2={y} stroke="currentColor" strokeWidth="0.2" className="text-muted-foreground" />
            {i % 5 === 0 && (
              <text x="54" y={y + 1} fontSize="3" className="fill-muted-foreground font-mono" textAnchor="start">
                {Math.round((y / 1000) * 100)}%
              </text>
            )}
          </g>
        ))}

        {/* Background Path */}
        <path
          d={pathData}
          stroke='currentColor'
          strokeWidth='0.3'
          className='text-muted/20'
          strokeDasharray='1 2'
        />
        
        {/* Progress Path */}
        <m.path
          d={pathData}
          stroke='currentColor'
          strokeWidth='1.2'
          className='text-primary/60'
          style={{ pathLength }}
          strokeLinecap='round'
          strokeDasharray='3 3'
        />
        
        {/* High-fidelity solid line for current position */}
        <m.path
          d={pathData}
          stroke='currentColor'
          strokeWidth='1.2'
          className='text-primary'
          style={{ pathLength }}
          strokeLinecap='round'
          // This one will be the primary visual focus
          strokeDasharray="1000 1000"
          strokeDashoffset={0}
        />

        {/* Floating coordinates indicator at the tip of the path could be added here if needed */}
      </svg>
    </div>
  );
};
