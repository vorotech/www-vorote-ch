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

  return (
    <m.div
      layout
      layoutId={id}
      initial={{ opacity: 0, scale: 0.9, x: isRight ? 40 : -40 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ 
        layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        opacity: { duration: 0.6 },
        scale: { duration: 0.6, ease: 'easeOut' },
        x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`relative bg-background/50 backdrop-blur-md p-5 md:p-8 rounded-2xl border border-primary/10 shadow-2xl w-full max-w-md cursor-pointer hover:border-primary/30 transition-all duration-300 group ${
        isRight ? 'text-left' : 'text-right'
      } ${isExpanded ? 'z-50 ring-1 ring-primary/20 shadow-primary/5' : 'z-0'}`}
    >
      {/* Decorative Corner (Architect feel) */}
      <div className={`absolute top-0 ${isRight ? 'right-0' : 'left-0'} w-12 h-12 overflow-hidden pointer-events-none opacity-20`}>
         <div className={`absolute top-2 ${isRight ? 'right-2' : 'left-2'} w-1 h-1 bg-primary rounded-full`} />
         <div className={`absolute top-2 ${isRight ? 'right-2' : 'left-2'} w-4 h-[1px] bg-primary`} />
         <div className={`absolute top-2 ${isRight ? 'right-2' : 'left-2'} w-[1px] h-4 bg-primary`} />
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
      <div className={`mt-4 flex ${isRight ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-40 transition-opacity`}>
         <Icons.Plus size={14} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} />
      </div>
    </m.div>
  );
};
