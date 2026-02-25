'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import Link from 'next/link';

interface JourneyMilestoneProps {
  id: string;
  title: string;
  year?: number;
  icon?: string;
  summary?: string;
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

export const JourneyMilestone = ({ 
  id,
  title, 
  year, 
  icon, 
  summary, 
  isRight,
  post
}: JourneyMilestoneProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = getIcon(icon);

  const postUrl = post?._sys?.breadcrumbs 
    ? `/posts/${post._sys.breadcrumbs.join('/')}` 
    : null;

  // Only allow expansion if there's a link OR if the summary is long enough to be truncated
  // (Assuming ~100 chars is the threshold for 2 lines in the collapsed view)
  const isExpandable = !!postUrl || (!!summary && summary.length > 100);

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9, x: isRight ? 40 : -40 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ 
        opacity: { duration: 0.6 },
        scale: { duration: 0.6, ease: 'easeOut' },
        x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      }}
      className="w-full max-w-md"
    >
      <m.div
        layout
        layoutId={id}
        transition={{ 
          layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        }}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
        className={`relative bg-background/50 backdrop-blur-md p-5 md:p-8 rounded-2xl border border-primary/10 shadow-2xl w-full transition-all duration-300 group ${
          isExpandable ? 'cursor-pointer hover:border-primary/30' : 'cursor-default'
        } ${
          isRight ? 'text-left' : 'text-right'
        } ${isExpanded ? 'z-50 ring-1 ring-primary/20 shadow-primary/5' : 'z-0'}`}
      >
        {/* Decorative Corner (Architect feel) */}
        <div className={`absolute top-0 ${isRight ? 'right-0' : 'left-0'} p-3 md:p-4 pointer-events-none transition-opacity duration-500 ${isExpanded ? 'opacity-40' : 'opacity-10'}`}>
          <div className={`flex items-start gap-1.5 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M12 0V24M0 12H24" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="0.5" />
              <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="1" />
            </svg>
            <div className={`flex flex-col text-[7px] font-mono text-primary uppercase tracking-[0.2em] leading-none pt-1 ${isRight ? 'items-end' : 'items-start'}`}>
              <span>Ref_{id.slice(0, 4)}</span>
              <span className="opacity-50 mt-1">pos:{isRight ? '1.0' : '0.0'}</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-4 mb-3 ${isRight ? 'flex-row' : 'flex-row-reverse'}`}>
          <m.div layout='position' className='p-2.5 bg-primary/5 rounded-xl text-primary/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
            <IconComponent size={22} strokeWidth={1.5} />
          </m.div>
          {year && (
            <m.span layout='position' className='text-primary/60 text-sm font-mono font-bold tracking-widest'>
              {year}
            </m.span>
          )}
        </div>
        
        <m.h3 layout='position' className='font-bold text-xl md:text-2xl leading-tight mb-3 tracking-tight'>
          {title}
        </m.h3>
        
        <AnimatePresence mode='wait'>
          {isExpanded && summary && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className='overflow-hidden'
            >
              <p className='text-muted-foreground text-base leading-relaxed mb-6 font-light'>
                {summary}
              </p>
              {postUrl && (
                <Link 
                  href={postUrl}
                  onClick={(e) => e.stopPropagation()}
                  className='inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline group/link'
                >
                  Read Professional Deep-Dive 
                  <Icons.ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              )}
            </m.div>
          )}
        </AnimatePresence>
        
        {!isExpanded && summary && (
          <p className='text-muted-foreground text-sm leading-relaxed line-clamp-2 opacity-50 group-hover:opacity-80 transition-opacity'>
            {summary}
          </p>
        )}

        {/* Expand/Collapse Hint */}
        {isExpandable && (
          <div className={`mt-4 flex ${isRight ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-40 transition-opacity`}>
             <Icons.Plus size={14} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} />
          </div>
        )}
      </m.div>
    </m.div>
  );
};
