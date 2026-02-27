'use client';
import React, { useEffect, useState } from 'react';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents = ({ data }: { data: any }) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  
  // Ensure levels is always an array of numbers
  const rawLevels = data?.levels || [2, 3];
  const levels = Array.isArray(rawLevels) ? rawLevels : [rawLevels];
  const validLevels = levels.filter((l): l is number => typeof l === 'number' && !isNaN(l));
  const minLevel = validLevels.length > 0 ? Math.min(...validLevels) : 2;

  // Use stringified levels as dependency to avoid infinite loops from array reference changes
  const levelsKey = JSON.stringify(validLevels);

  useEffect(() => {
    if (validLevels.length === 0) return;

    // Generate selector based on levels
    const selector = validLevels.map((l: number) => `h${l}`).join(', ');
    
    // Find all headings within the main content area
    // We target the article or main container to avoid picking up TOC itself or nav
    const elements = Array.from(document.querySelectorAll(`main ${selector}, article ${selector}`));
    
    const items: TOCItem[] = elements.map((el) => {
      // Ensure element has an ID for linking
      if (!el.id) {
        el.id = el.textContent
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '') || `heading-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      return {
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName.substring(1)),
      };
    });

    setHeadings(items);
  }, [levelsKey]);

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update the URL hash without a jump
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="py-8 not-prose" data-tina-field={tinaField(data)}>
      <div className="max-w-prose mx-auto bg-muted/20 dark:bg-muted/30 backdrop-blur-sm border border-border/40 rounded-3xl p-8 shadow-sm group">
        <nav>
          <ul className="space-y-3 list-none p-0 m-0">
            {headings.map((heading, index) => (
              <li 
                key={`${heading.id}-${index}`}
                style={{ marginLeft: `${(heading.level - minLevel) * 1.5}rem` }}
                className="relative list-none p-0 m-0"
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => scrollToHeading(e, heading.id)}
                  className={cn(
                    "text-sm font-bold transition-all duration-300 hover:text-primary flex items-center gap-2 group/link",
                    heading.level === minLevel ? "text-foreground" : "text-muted-foreground/80 dark:text-muted-foreground font-medium"
                  )}
                >
                  <span className="size-1 rounded-full bg-primary/30 group-hover/link:bg-primary group-hover/link:scale-150 transition-all shrink-0" />
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export const tableOfContentsBlockSchema: Template = {
  name: 'tableOfContents',
  label: 'Table of Contents',
  ui: {
    previewSrc: '/blocks/toc.png',
    defaultItem: {
      levels: [2, 3],
    },
  },
  fields: [
    {
      type: 'number',
      name: 'levels',
      label: 'Heading Levels',
      list: true,
      description: 'Which heading levels to include (e.g., 2 for h2, 3 for h3)',
    },
  ],
};
