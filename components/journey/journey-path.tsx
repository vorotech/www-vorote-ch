'use client';

import { type MotionValue, m, useSpring, useTransform } from 'motion/react';
import React, { useMemo, useEffect, useState } from 'react';

interface JourneyPathProps {
  progress: MotionValue<number>;
  milestoneCount?: number;
}

export const JourneyPath = ({ progress, milestoneCount = 6 }: JourneyPathProps) => {
  const [amplitude, setAmplitude] = useState(20);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setAmplitude(isMobile ? 8 : 25);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map progress so it starts at the first milestone and ends at the last
  // Offset is 1/(2*N) because the path starts at the center of the first row
  const offset = 1 / (2 * milestoneCount);
  const transformedProgress = useTransform(progress, [offset, 1 - offset], [0, 1]);

  const pathLength = useSpring(transformedProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  const pathData = useMemo(() => {
    if (milestoneCount <= 0) return '';

    // Start and end at the center of the first and last rows
    // Coordinate space is 0-100
    const startY = 100 / (2 * milestoneCount);
    const endY = 100 - startY;

    if (milestoneCount === 1) return `M 50 0 L 50 100`;

    const totalPathHeight = endY - startY;
    const step = totalPathHeight / (milestoneCount - 1);

    const points = [`M 50 ${startY}`];

    for (let i = 0; i < milestoneCount - 1; i++) {
      const currentY = startY + i * step;
      const nextY = startY + (i + 1) * step;
      const isRight = i % 2 === 0;
      const xOffset = isRight ? amplitude : -amplitude;

      const cpX = 50 + xOffset;
      const cpY1 = currentY + step * 0.4;
      const cpY2 = currentY + step * 0.6;

      points.push(`C ${cpX} ${cpY1}, ${cpX} ${cpY2}, 50 ${nextY}`);
    }

    return points.join(' ');
  }, [milestoneCount, amplitude]);

  // Generate tick marks for "Architect" aesthetic
  const ticks = useMemo(() => {
    const count = 10;
    return Array.from({ length: count }).map((_, i) => (i * 100) / (count - 1));
  }, []);

  return (
    <div className='absolute top-0 left-0 w-full h-full pointer-events-none -z-10'>
      <svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-full h-full overflow-visible' preserveAspectRatio='none'>
        <title>Journey Path</title>

        {/* Architectural Grid / Ticks */}
        {ticks.map((y, i) => (
          <g key={i} className='opacity-10'>
            <line x1='45' y1={y} x2='55' y2={y} stroke='currentColor' strokeWidth='0.1' className='text-muted-foreground' />
            {i % 2 === 0 && (
              <text x='58' y={y + 0.5} fontSize='1.5' className='fill-muted-foreground font-mono' textAnchor='start'>
                {Math.round(y)}%
              </text>
            )}
          </g>
        ))}

        {/* Background Path */}
        <path d={pathData} stroke='currentColor' strokeWidth='0.2' className='text-muted/30' strokeDasharray='1 1' />

        {/* Progress Path (Dashed) */}
        <m.path
          d={pathData}
          stroke='currentColor'
          strokeWidth='0.8'
          className='text-primary/40'
          style={{ pathLength }}
          strokeLinecap='round'
          strokeDasharray='2 2'
        />

        {/* High-fidelity solid line for current position */}
        <m.path d={pathData} stroke='currentColor' strokeWidth='0.8' className='text-primary' style={{ pathLength }} strokeLinecap='round' />
      </svg>
    </div>
  );
};
