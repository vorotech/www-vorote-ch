'use client';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { Card } from '../ui/card';

interface FeaturedLinkProps {
  title: string;
  description?: TinaMarkdownContent;
  url: string;
  icon?: string;
  bannerImage?: string;
  openInNewTab?: boolean;
}

export const FeaturedLink = ({ title, description, url, icon, bannerImage, openInNewTab = true }: FeaturedLinkProps) => {
  const linkProps = {
    href: url,
    target: openInNewTab ? '_blank' : undefined,
    rel: openInNewTab ? 'noopener noreferrer' : undefined,
  };

  // Resolve Lucide icon
  //@ts-ignore
  const IconComponent = icon && LucideIcons[icon] ? LucideIcons[icon] : null;

  return (
    <div className='my-8 not-prose'>
      <Link {...linkProps} className='block group no-underline'>
        <Card className='overflow-hidden bg-card/50 hover:bg-card border-border hover:border-primary/40 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md p-0 group-hover:-translate-y-0.5'>
          {bannerImage ? (
            <div className='flex flex-col sm:flex-row'>
              <div className='relative w-full sm:w-1/3 aspect-video sm:aspect-square overflow-hidden border-b sm:border-b-0 sm:border-r border-border/30'>
                <Image src={bannerImage} alt={title} fill className='object-cover transition-transform duration-500 group-hover:scale-105' />
              </div>
              <div className='flex-1 p-6 flex flex-col justify-center'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <h3 className='text-xl font-bold font-abel text-foreground group-hover:text-primary group-hover:underline transition-colors flex items-center gap-2'>
                      {title}
                      <ArrowUpRight className='w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 no-underline' />
                    </h3>
                    {description && (
                      <div className='text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed no-underline'>
                        <TinaMarkdown content={description} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='p-6 flex items-center gap-6'>
              <div className='flex-shrink-0 size-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500'>
                {IconComponent ? <IconComponent className='size-7' /> : <LucideIcons.ExternalLink className='size-7' />}
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-xl font-bold font-abel text-foreground group-hover:text-primary group-hover:underline transition-colors flex items-center gap-2'>
                  {title}
                  <ArrowUpRight className='w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 no-underline' />
                </h3>
                {description && (
                  <div className='text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed no-underline'>
                    <TinaMarkdown content={description} />
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
};
