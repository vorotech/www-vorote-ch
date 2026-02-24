'use client';
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { PostQuery } from '@/tina/__generated__/types';
import { useLayout } from '@/components/layout/layout-context';
import { Section } from '@/components/layout/section';
import { components } from '@/components/mdx-components';
import ErrorBoundary from '@/components/error-boundary';

const titleColorClasses = {
  blue: 'from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500',
  teal: 'from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500',
  green: 'from-green-400 to-green-600',
  red: 'from-red-400 to-red-600',
  pink: 'from-pink-300 to-pink-500',
  purple: 'from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500',
  orange: 'from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500',
  yellow: 'from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500',
};

interface ClientPostProps {
  data: PostQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function PostClientPage(props: ClientPostProps) {
  const { theme } = useLayout();
  const { data } = useTina({ ...props });
  const post = data.post;

  const date = new Date(post.date!);
  let formattedDate = '';
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, 'MMM dd, yyyy');
  }

  const titleColour = titleColorClasses[theme!.color! as keyof typeof titleColorClasses];

  return (
    <ErrorBoundary>
      <Section className="py-20 relative overflow-hidden">
        {/* Decorative background glow from hero image */}
        {post.heroImg && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] -z-10 pointer-events-none select-none">
            {/* Base soft glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[140px] opacity-20 dark:opacity-15 rounded-full overflow-hidden">
               <Image
                src={post.heroImg}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover scale-150"
              />
            </div>
            {/* More sensitive/vibrant center glow */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] blur-[80px] opacity-40 dark:opacity-25 rounded-full overflow-hidden animate-pulse duration-[10s]">
               <Image
                src={post.heroImg}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover scale-110 saturate-150"
              />
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 relative">
          <h1 data-tina-field={tinaField(post, 'title')} className="w-full relative mb-10 text-5xl md:text-7xl font-extrabold tracking-tight text-center font-heading leading-tight drop-shadow-sm">
            <span className={`bg-clip-text text-transparent bg-linear-to-r ${titleColour}`}>
              {post.title}
            </span>
          </h1>

          {post.tags && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {post.tags.map((tagObj: any) => (
                tagObj?.tag && (
                  <span 
                    key={tagObj.tag.name} 
                    className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-background/50 dark:bg-zinc-900/50 text-foreground border border-border/50 rounded-full backdrop-blur-sm shadow-sm"
                  >
                    {tagObj.tag.name}
                  </span>
                )
              ))}
            </div>
          )}

          <div data-tina-field={tinaField(post, 'author')} className="flex items-center justify-center mb-16 space-x-8 border-y border-border/50 py-8">
            {post.author && (
              <div className="flex items-center group">
                {post.author.avatar && (
                  <div className="shrink-0 mr-4 overflow-hidden rounded-full ring-2 ring-primary/20 transition-all group-hover:ring-primary/40 shadow-lg">
                    <Image
                      data-tina-field={tinaField(post.author, 'avatar')}
                      priority={true}
                      className="h-14 w-14 object-cover"
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={100}
                      height={100}
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Author</span>
                  <p
                    data-tina-field={tinaField(post.author, 'name')}
                    className="text-sm font-black text-foreground group-hover:text-primary transition-colors"
                  >
                    {post.author.name}
                  </p>
                </div>
              </div>
            )}
            
            <div className="h-10 w-[1px] bg-border/50" />
            
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Published</span>
              <p
                data-tina-field={tinaField(post, 'date')}
                className="text-sm font-bold text-foreground"
              >
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <div data-tina-field={tinaField(post, '_body')} className="prose dark:prose-invert w-full max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-p:leading-relaxed prose-pre:p-0 prose-img:rounded-2xl selection:bg-primary/20">
            <TinaMarkdown
              content={post._body}
              components={{
                ...components,
                a: (props: any) => (
                  <a
                    href={props.url}
                    className="text-primary hover:text-primary/80 underline-offset-4 decoration-primary/30 transition-all"
                    target={props.url?.startsWith('http') ? '_blank' : undefined}
                    rel={props.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {props.children}
                  </a>
                ),
              }}
            />
          </div>
        </div>
      </Section>
    </ErrorBoundary>
  );
}
