'use client';

import React from 'react';
import { TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface DisclosureProps {
  title: string;
  children: TinaMarkdownContent;
  defaultOpen?: boolean;
}

export function DisclosureBlock({ title, children, defaultOpen = false }: DisclosureProps) {
  return (
    <div className="my-6 w-full max-w-3xl overflow-hidden rounded-xl border border-mocha-teal/20 bg-mocha-crust/30 backdrop-blur-sm shadow-sm transition-all hover:border-mocha-teal/40">
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-mocha-teal/5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg bg-mocha-teal/10 text-mocha-teal transition-all duration-300",
                  open ? "scale-110 shadow-lg shadow-mocha-teal/20" : "scale-100"
                )}>
                  <Zap size={16} fill={open ? "currentColor" : "none"} />
                </div>
                <span className={cn(
                  "font-heading text-base tracking-wide transition-colors",
                  open ? "text-mocha-teal" : "text-mocha-text/90"
                )}>
                  {title}
                </span>
              </div>
              <ChevronRight 
                size={20} 
                className={cn(
                  "text-mocha-teal/50 transition-transform duration-300 ease-in-out",
                  open ? "rotate-90" : "rotate-0"
                )} 
              />
            </DisclosureButton>
            
            <AnimatePresence>
              {open && (
                <DisclosurePanel static as={motion.div}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 border-t border-mocha-teal/10">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-mocha-text/80 leading-relaxed bg-mocha-base/20 rounded-lg p-4">
                      <TinaMarkdown content={children} />
                    </div>
                  </div>
                </DisclosurePanel>
              )}
            </AnimatePresence>
          </>
        )}
      </Disclosure>
    </div>
  );
}

export const disclosureBlockSchema = {
  name: 'Disclosure',
  label: 'Technical Deep-Dive (Collapsible)',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
      required: true,
    },
    {
      name: 'children',
      label: 'Content',
      type: 'rich-text',
    },
    {
      name: 'defaultOpen',
      label: 'Default Open',
      type: 'boolean',
    },
  ],
  ui: {
    defaultItem: {
      title: 'Technical Specification',
      defaultOpen: false,
    },
  },
};
