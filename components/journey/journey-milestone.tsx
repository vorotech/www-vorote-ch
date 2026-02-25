'use client';

import * as Icons from 'lucide-react';
import { m } from 'motion/react';
import Link from 'next/link';
import React from 'react';

interface JourneyMilestoneProps {
  id: string;
  title: string;
  year?: number;
  icon?: string;
  summary?: string;
  linkTitle?: string;
  isRight?: boolean;
  post?: {
    _sys?: {
      breadcrumbs?: string[];
    };
  };
}

// Map of common icons or fallbacks
const getIcon = (iconName?: string) => {
  if (!iconName) return Icons.Circle;
  const icon = (Icons as any)[iconName];
  return icon || Icons.Circle;
};

export const JourneyMilestone = ({ id, title, year, icon, summary, linkTitle, isRight, post }: JourneyMilestoneProps) => {
  const IconComponent = getIcon(icon);

  const postUrl = post?._sys?.breadcrumbs ? `/posts/${post._sys.breadcrumbs.join('/')}` : null;

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9, x: isRight ? 40 : -40 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{
        opacity: { duration: 0.6 },
        scale: { duration: 0.6, ease: 'easeOut' },
        x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      }}
      className='w-full max-w-md'
    >
      <div
        className={`relative bg-background/50 backdrop-blur-md p-5 md:p-8 rounded-2xl border border-primary/10 shadow-2xl w-full transition-all duration-300 group ${
          isRight ? 'text-left' : 'text-right'
        } z-0`}
      >
        {/* Decorative Corner (Architect feel) */}
        <div
          className={`absolute top-0 ${isRight ? 'right-0' : 'left-0'} p-3 md:p-4 pointer-events-none transition-opacity duration-500 opacity-20 group-hover:opacity-40`}
        >
          <div className={`flex items-start gap-1.5 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' className='text-primary'>
              <path d='M12 0V24M0 12H24' stroke='currentColor' strokeWidth='0.5' strokeDasharray='2 2' />
              <circle cx='12' cy='12' r='4' stroke='currentColor' strokeWidth='0.5' />
              <path d='M8 12H16M12 8V16' stroke='currentColor' strokeWidth='1' />
            </svg>
            <div
              className={`flex flex-col text-[7px] font-mono text-primary uppercase tracking-[0.2em] leading-none pt-1 ${isRight ? 'items-end' : 'items-start'}`}
            >
              <span>Ref_{id.slice(0, 4)}</span>
              <span className='opacity-50 mt-1'>pos:{isRight ? '1.0' : '0.0'}</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-4 mb-3 ${isRight ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className='p-2.5 bg-primary/5 rounded-xl text-primary/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
            <IconComponent size={22} strokeWidth={1.5} />
          </div>
          {year && <span className='text-primary/60 text-sm font-mono font-bold tracking-widest'>{year}</span>}
        </div>

        <h3 className='font-bold text-xl md:text-2xl leading-tight mb-3 tracking-tight'>{title}</h3>

        {summary && (
          <div className='overflow-hidden'>
            <p className='text-muted-foreground text-sm md:text-base leading-relaxed mb-6 font-light'>{summary}</p>
            {postUrl && (
              <Link href={postUrl} className='inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline group/link pr-2'>
                {linkTitle || 'Read Professional Deep-Dive'}
                <Icons.ArrowRight size={16} className='group-hover/link:translate-x-1 transition-transform' />
              </Link>
            )}
          </div>
        )}
      </div>
    </m.div>
  );
};
