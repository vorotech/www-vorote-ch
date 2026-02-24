'use client';

import React, { useRef } from 'react';
import { useScroll, LayoutGroup } from 'motion/react';
import { JourneyPath } from './journey-path';
import { JourneyMilestone } from './journey-milestone';

interface JourneyRoadmapProps {
  title: string;
  milestones?: any[];
}

export const JourneyRoadmap = ({ title, milestones = [] }: JourneyRoadmapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  return (
    <section className='relative w-full max-w-5xl mx-auto py-24 px-4' ref={containerRef}>
      {/* Background Architectural Grid (Optional but fits theme) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-4xl mx-auto mb-24 text-center">
        <h2 className='text-3xl md:text-5xl font-bold mb-4 tracking-tight'>{title}</h2>
        <div className="h-1 w-24 bg-primary mx-auto opacity-60" />
      </div>
      
      <div className='relative'>
        {/* S-curve background path with dynamic milestone count */}
        <JourneyPath progress={scrollYProgress} milestoneCount={milestones.length} />
        
        {/* Milestones container */}
        <LayoutGroup>
          <div className='relative flex flex-col gap-24 md:gap-36 py-12'>
            {milestones.map((m, i) => {
              const milestoneData = m?.milestone;
              if (!milestoneData) return null;

              const isRight = i % 2 !== 0;

              return (
                <div 
                  key={i} 
                  className={`flex items-center w-full ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Milestone Content */}
                  <div className={`w-[45%] flex ${isRight ? 'justify-start' : 'justify-end'}`}>
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

                  {/* Path Marker */}
                  <div className='w-[10%] relative flex justify-center items-center'>
                    <div className='z-10 w-4 h-4 bg-background border-2 border-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' />
                    <div className='absolute w-8 h-[1px] bg-primary/20 -z-10' />
                  </div>

                  {/* Empty Spacer */}
                  <div className='w-[45%]' />
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
};
