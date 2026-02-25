'use client';

import { LayoutGroup, useScroll } from 'motion/react';
import React, { useRef } from 'react';
import { JourneyMilestone } from './journey-milestone';
import { JourneyPath } from './journey-path';

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
  const validMilestones = React.useMemo(() => milestones.filter((m) => m?.milestone), [milestones]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const milestoneCount = validMilestones.length;

  return (
    <section className='relative w-full max-w-5xl mx-auto py-8 px-4'>
      {/* Background Architectural Grid (Optional but fits theme) */}
      <div className='absolute inset-0 opacity-[0.03] pointer-events-none -z-20 overflow-hidden'>
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]' />
      </div>

      <div className='max-w-4xl mx-auto mb-12 text-center'>
        <h2 className='text-3xl md:text-5xl font-bold mb-4 tracking-tight'>{title}</h2>
        <div className='h-1 w-24 bg-primary mx-auto opacity-60' />
      </div>

      <div className='relative' ref={containerRef}>
        {/* S-curve background path with dynamic milestone count */}
        {milestoneCount > 0 && (
          <div className='absolute inset-0 pointer-events-none -z-10'>
            <JourneyPath progress={scrollYProgress} milestoneCount={milestoneCount} />
          </div>
        )}

        {/* Milestones container */}
        <LayoutGroup>
          <div
            className='relative grid grid-cols-1'
            style={{
              gridTemplateRows: `repeat(${milestoneCount}, 1fr)`,
            }}
          >
            {validMilestones.map((m, i) => {
              const milestoneData = m.milestone;
              const isRight = i % 2 !== 0;

              return (
                <div key={i} className='grid grid-cols-[1fr_40px_1fr] md:grid-cols-[1fr_80px_1fr] w-full min-h-[160px]'>
                  {/* Left Column */}
                  <div className={`flex items-center justify-end pr-4 md:pr-8 h-full ${isRight ? 'opacity-0 pointer-events-none' : ''}`}>
                    {!isRight && (
                      <div className='w-full max-w-md'>
                        <JourneyMilestone
                          id={`milestone-${i}`}
                          title={milestoneData.title}
                          year={milestoneData.year}
                          summary={milestoneData.summary}
                          linkTitle={m.linkTitle || milestoneData.linkTitle}
                          icon={milestoneData.icon}
                          isRight={false}
                          post={milestoneData.post}
                        />
                      </div>
                    )}
                  </div>

                  {/* Center Column (Marker) */}
                  <div className='relative flex justify-center items-center h-full'>
                    <div className='z-10 w-4 h-4 bg-background border-2 border-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' />
                    <div className='absolute w-8 h-[1px] bg-primary/20 -z-10' />
                  </div>

                  {/* Right Column */}
                  <div className={`flex items-center justify-start pl-4 md:pl-8 h-full ${!isRight ? 'opacity-0 pointer-events-none' : ''}`}>
                    {isRight && (
                      <div className='w-full max-w-md'>
                        <JourneyMilestone
                          id={`milestone-${i}`}
                          title={milestoneData.title}
                          year={milestoneData.year}
                          summary={milestoneData.summary}
                          linkTitle={m.linkTitle || milestoneData.linkTitle}
                          icon={milestoneData.icon}
                          isRight={true}
                          post={milestoneData.post}
                        />
                      </div>
                    )}
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
