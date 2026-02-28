import { PageBlocksVideo } from '@/tina/__generated__/types';
import { PageBlocksRecent } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Image from 'next/image';
import React from 'react';
import { Components, TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { FeaturedLink } from './blocks/featured-link';
import { Mermaid } from './blocks/mermaid';
import { RecentPosts } from './blocks/recent-posts';
import { TableOfContents } from './blocks/table-of-contents';
import { TBody, TD, TH, THead, TR, Table } from './blocks/table';
import { Video } from './blocks/video';
import { CodeBlock } from './ui/code-block';

export const components: Components<{
  BlockQuote: {
    children: TinaMarkdownContent;
    authorName: string;
  };
  DateTime: {
    format?: string;
  };
  NewsletterSignup: {
    placeholder: string;
    buttonText: string;
    children: TinaMarkdownContent;
    disclaimer?: TinaMarkdownContent;
  };
  FeaturedLink: {
    title: string;
    description?: TinaMarkdownContent;
    url: string;
    bannerImage?: string;
    backgroundColor?: 'blue' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple' | 'gray' | 'white';
    textColor?: 'blue' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple' | 'gray' | 'white' | 'black';
    openInNewTab?: boolean;
  };
  video: PageBlocksVideo;
  recentPosts: PageBlocksRecent;
}> = {
  code_block: (props: any) => {
    if (!props) {
      return <></>;
    }

    if (props.lang === 'mermaid') {
      return <Mermaid value={props.value} />;
    }

    return <CodeBlock lang={props.lang} value={props.value} />;
  },
  BlockQuote: (props: {
    children: TinaMarkdownContent;
    authorName: string;
  }) => {
    return (
      <div className='my-10 pl-6 border-l-4 border-primary/50 bg-primary/5 dark:bg-primary/10 py-6 pr-6 rounded-r-xl italic shadow-sm'>
        <blockquote className='text-xl font-medium leading-relaxed text-foreground/90 mb-4'>
          <TinaMarkdown content={props.children} />
        </blockquote>
        {props.authorName && <cite className='not-italic font-bold text-sm uppercase tracking-widest text-primary/80'>— {props.authorName}</cite>}
      </div>
    );
  },
  DateTime: (props: any) => {
    const dt = React.useMemo(() => {
      return new Date();
    }, []);

    switch (props.format) {
      case 'iso':
        return <span>{format(dt, 'yyyy-MM-dd')}</span>;
      case 'utc':
        return <span>{format(dt, 'eee, dd MMM yyyy HH:mm:ss OOOO')}</span>;
      case 'local':
        return <span>{format(dt, 'P')}</span>;
      default:
        return <span>{format(dt, 'P')}</span>;
    }
  },
  NewsletterSignup: (props: any) => {
    return (
      <div className='bg-card border border-border rounded-2xl p-8 my-12 shadow-lg backdrop-blur-sm'>
        <div className='max-w-3xl mx-auto'>
          <div className='prose prose-sm dark:prose-invert mb-8'>
            <TinaMarkdown content={props.children} />
          </div>
          <form className='sm:flex gap-4'>
            <label htmlFor='email-address' className='sr-only'>
              Email address
            </label>
            <input
              id='email-address'
              name='email-address'
              type='email'
              autoComplete='email'
              required
              className='w-full px-5 py-3 border border-input bg-background/50 placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:max-w-xs rounded-xl transition-all'
              placeholder={props.placeholder}
            />
            <div className='mt-3 sm:mt-0 sm:shrink-0'>
              <button
                type='submit'
                className='w-full flex items-center justify-center py-3 px-8 border border-transparent text-base font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md active:scale-[0.98]'
              >
                {props.buttonText}
              </button>
            </div>
          </form>
          <div className='mt-4 text-xs text-muted-foreground italic'>{props.disclaimer && <TinaMarkdown content={props.disclaimer} />}</div>
        </div>
      </div>
    );
  },
  img: (props: any) => {
    if (!props) {
      return <></>;
    }
    return (
      <span className='flex flex-col items-center justify-center my-10 group'>
        <span className='relative rounded-2xl overflow-hidden border border-border shadow-xl transition-transform duration-500 group-hover:scale-[1.01] block'>
          <Image src={props.url} alt={props.alt || ''} width={1200} height={800} className='w-full h-auto object-cover !m-0 block' />
        </span>
        {props.alt && <span className='mt-4 text-sm text-muted-foreground italic font-medium tracking-tight text-center max-w-xl block'>{props.alt}</span>}
      </span>
    );
  },
  FeaturedLink: (props: any) => {
    return <FeaturedLink {...props} />;
  },
  tableOfContents: (props: any) => <TableOfContents data={props} />,
  mermaid: (props: any) => <Mermaid {...props} />,
  video: (props: any) => {
    return <Video data={props} />;
  },
  recentPosts: (props: any) => {
    return <RecentPosts data={props} />;
  },
  table: (props: any) => <Table {...props} />,
  thead: (props: any) => <THead {...props} />,
  tbody: (props: any) => <TBody {...props} />,
  tr: (props: any) => <TR {...props} />,
  th: (props: any) => <TH {...props} />,
  td: (props: any) => <TD {...props} />,
} as any;
