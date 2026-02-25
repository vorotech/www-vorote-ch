'use client';

import React, { useRef } from 'react';
import { useScroll, LayoutGroup } from 'motion/react';
import { JourneyPath } from './journey-path';
import { JourneyMilestone } from './journey-milestone';

interface JourneyRoadmapProps {
  title: string;
  milestones?: {
    __typename?: string;
    milestone?: any;
  }[];
}

export const JourneyRoadmap = ({ title, milestones = [] }: JourneyRoadmapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter out invalid milestones once to ensure consistent count across all calculations
  const validMilestones = React.useMemo(() => 
    milestones.filter(m => m?.milestone), 
    [milestones]
  );
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const milestoneCount = validMilestones.length;

  return (
    <section className='relative w-full max-w-5xl mx-auto py-8 px-4'>
      {/* Background Architectural Grid (Optional but fits theme) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h2 className='text-3xl md:text-5xl font-bold mb-4 tracking-tight'>{title}</h2>
        <div className="h-1 w-24 bg-primary mx-auto opacity-60" />
      </div>
      
      <div className='relative' ref={containerRef}>
        {/* S-curve background path with dynamic milestone count */}
        {milestoneCount > 0 && (
          <div 
            className='absolute left-0 w-full pointer-events-none -z-10'
            style={{ 
              top: `${100 / (2 * milestoneCount)}%`,
              bottom: `${100 / (2 * milestoneCount)}%`
            }}
          >
            <JourneyPath progress={scrollYProgress} milestoneCount={milestoneCount} />
          </div>
        )}
        
        {/* Milestones container */}
        <LayoutGroup>
          <div 
            className='relative grid grid-cols-1'
            style={{ 
              gridTemplateRows: `repeat(${milestoneCount}, minmax(min-content, 1fr))` 
            }}
          >
            {validMilestones.map((m, i) => {
              const milestoneData = m.milestone;
              const isRight = i % 2 !== 0;

              return (
                <div 
                  key={i} 
                  className="grid grid-cols-[1fr_40px_1fr] md:grid-cols-[1fr_80px_1fr] items-center w-full"
                >
                  {/* Milestone Content */}
                  <div className={`flex items-center py-8 md:py-12 ${isRight ? 'col-start-3 justify-start' : 'col-start-1 justify-end'}`}>
                    <div className="w-full max-w-md">
                      <JourneyMilestone 
                        id={`milestone-${i}`}
                        title={milestoneData.title}
                        year={milestoneData.year}
                        summary={milestoneData.summary}
                        icon={milestoneData.icon}
                        isRight={isRight}
                        post={milestoneData.post}
                      />
                    </div>
                  </div>

                  {/* Path Marker */}
                  <div className='col-start-2 relative flex justify-center items-center h-full'>
                    <div className='z-10 w-4 h-4 bg-background border-2 border-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' />
                    <div className='absolute w-8 h-[1px] bg-primary/20 -z-10' />
                  </div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
};
