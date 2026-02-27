'use client';

import React from 'react';
import { TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { BookOpen, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  title?: string;
  children: TinaMarkdownContent;
  variant?: 'citation' | 'note' | 'info';
  className?: string;
}

export function Sidebar({ title, children, variant = 'citation', className }: SidebarProps) {
  const styles = {
    citation: {
      icon: <BookOpen size={16} />,
      border: 'border-mocha-blue/20',
      bg: 'bg-mocha-blue/5',
      text: 'text-mocha-blue',
      glow: 'bg-mocha-blue/5',
    },
    note: {
      icon: <Info size={16} />,
      border: 'border-mocha-teal/20',
      bg: 'bg-mocha-teal/5',
      text: 'text-mocha-teal',
      glow: 'bg-mocha-teal/5',
    },
    info: {
      icon: <Info size={16} />,
      border: 'border-mocha-mauve/20',
      bg: 'bg-mocha-mauve/5',
      text: 'text-mocha-mauve',
      glow: 'bg-mocha-mauve/5',
    },
  }[variant];

  return (
    <aside className={cn(
      "md:float-right md:w-72 md:ml-8 md:mb-8 md:mt-2 relative z-10",
      "md:sticky md:top-24",
      "w-full my-6",
      className
    )}>
      <div className={cn(
        "rounded-xl border p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md",
        styles.border,
        styles.bg
      )}>
        {title && (
          <h4 className={cn(
            "font-heading text-xs tracking-widest uppercase mb-3 flex items-center gap-2",
            styles.text
          )}>
            <span className="p-1 rounded bg-white/5">{styles.icon}</span>
            {title}
          </h4>
        )}
        
        <div className="prose prose-xs dark:prose-invert max-w-none text-mocha-text/80 leading-relaxed italic">
          <TinaMarkdown content={children} />
        </div>
        
        {/* Glow */}
        <div className={cn(
          "absolute -right-4 -top-4 w-20 h-20 blur-[30px] rounded-full pointer-events-none -z-10",
          styles.glow
        )} />
      </div>
    </aside>
  );
}

export const sidebarBlockSchema = {
  name: 'Sidebar',
  label: 'Sticky Sidebar (Citation/Note)',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
    },
    {
      name: 'variant',
      label: 'Variant',
      type: 'string',
      options: [
        { label: 'Citation', value: 'citation' },
        { label: 'Note', value: 'note' },
        { label: 'Info', value: 'info' },
      ],
    },
    {
      name: 'children',
      label: 'Content',
      type: 'rich-text',
    },
  ],
  ui: {
    defaultItem: {
      title: 'Citation',
      variant: 'citation',
    },
  },
};
