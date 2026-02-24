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
      <Section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 data-tina-field={tinaField(post, 'title')} className="w-full relative mb-10 text-5xl md:text-7xl font-extrabold tracking-tight text-center font-heading leading-tight">
            <span className={`bg-clip-text text-transparent bg-linear-to-r ${titleColour}`}>
              {post.title}
            </span>
          </h1>

          <div data-tina-field={tinaField(post, 'author')} className="flex items-center justify-center mb-16 space-x-4 border-y border-border/50 py-6">
            {post.author && (
              <div className="flex items-center group">
                {post.author.avatar && (
                  <div className="shrink-0 mr-3 overflow-hidden rounded-full ring-2 ring-primary/20 transition-all group-hover:ring-primary/40">
                    <Image
                      data-tina-field={tinaField(post.author, 'avatar')}
                      priority={true}
                      className="h-12 w-12 object-cover"
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={100}
                      height={100}
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-0.5">Author</span>
                  <p
                    data-tina-field={tinaField(post.author, 'name')}
                    className="text-sm font-bold text-foreground group-hover:text-primary transition-colors"
                  >
                    {post.author.name}
                  </p>
                </div>
              </div>
            )}
            
            <div className="h-8 w-[1px] bg-border/50" />
            
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-0.5">Published</span>
              <p
                data-tina-field={tinaField(post, 'date')}
                className="text-sm font-medium text-foreground"
              >
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {post.heroImg && (
          <div className="px-4 w-full mb-20">
            <div data-tina-field={tinaField(post, 'heroImg')} className="relative max-w-5xl mx-auto group">
              <Image
                priority={true}
                src={post.heroImg}
                alt={post.title}
                className="absolute inset-0 block mx-auto rounded-3xl w-full h-full blur-3xl opacity-20 dark:opacity-10 scale-105 pointer-events-none transition-opacity group-hover:opacity-30"
                aria-hidden="true"
                width={1200}
                height={600}
              />
              <Image
                priority={true}
                src={post.heroImg}
                alt={post.title}
                width={1200}
                height={600}
                className="relative z-10 mx-auto block rounded-3xl w-full h-auto shadow-2xl border border-border/50 transition-transform duration-700 group-hover:scale-[1.005]"
              />
            </div>
          </div>
        )}

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
