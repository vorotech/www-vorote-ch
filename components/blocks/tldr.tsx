'use client';

import React from 'react';
import { TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { Lightbulb } from 'lucide-react';

export interface TldrProps {
  title?: string;
  children: TinaMarkdownContent;
}

export function Tldr({ title = 'Executive Summary', children }: TldrProps) {
  return (
    <div className="my-8 rounded-2xl border border-mocha-mauve/20 bg-mocha-mantle/50 p-6 backdrop-blur-sm shadow-lg overflow-hidden relative group">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-mocha-mauve/50" />
      
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 rounded-lg bg-mocha-mauve/10 text-mocha-mauve">
          <Lightbulb size={20} />
        </div>
        
        <div className="flex-1">
          <h3 className="text-mocha-mauve font-heading text-lg tracking-wide uppercase mb-3 flex items-center gap-2">
            {title}
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-mocha-text/90 leading-relaxed">
            <TinaMarkdown content={children} />
          </div>
        </div>
      </div>
      
      {/* Subtle background glow */}
      <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-mocha-mauve/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-mocha-mauve/10 transition-colors duration-500" />
    </div>
  );
}

export const tldrBlockSchema = {
  name: 'Tldr',
  label: 'TL;DR / Executive Summary',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
    },
    {
      name: 'children',
      label: 'Content',
      type: 'rich-text',
    },
  ],
  ui: {
    defaultItem: {
      title: 'Executive Summary',
    },
  },
};
