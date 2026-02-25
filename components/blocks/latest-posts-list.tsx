'use client';
import client from '@/tina/__generated__/client';
import { format } from 'date-fns';
import Link from 'next/link';
import * as React from 'react';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { Section, sectionBlockSchemaField } from '../layout/section';

interface LatestPostsListData {
  title?: string;
  postsCount?: number;
  skipCount?: number;
  background?: string;
  [key: string]: unknown;
}

interface ProcessedPost {
  id: string;
  date: Date;
  dayOfMonth: string;
  monthYear: string;
  title: string;
  description: string;
  url: string;
}

export const LatestPostsList = ({ data }: { data: LatestPostsListData }) => {
  const [posts, setPosts] = React.useState<ProcessedPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await client.queries.postConnection({
          sort: 'date',
          last: 50, // Fetch more posts to ensure we have enough
        });

        if (response.data?.postConnection.edges) {
          const allPosts = response.data.postConnection.edges
            .map((postData) => {
              const post = postData!.node!;
              const date = new Date(post.date!);

              if (isNaN(date.getTime())) {
                return null;
              }

              // Extract first paragraph from excerpt for description
              let description = '';
              if (post.excerpt?.children?.[0]?.children?.[0]?.text) {
                description = post.excerpt.children[0].children[0].text;
              }

              return {
                id: post.id,
                date,
                dayOfMonth: format(date, 'dd'),
                monthYear: format(date, 'MMM yyyy'),
                title: post.title || '',
                description,
                url: `/posts/${post._sys.breadcrumbs.join('/')}`,
              };
            })
            .filter((post): post is ProcessedPost => post !== null);

          // Skip first 4 posts and take the remaining based on postsCount
          const offset = data.skipCount || 4;
          const count = data.postsCount || 5;
          const selectedPosts = allPosts.slice(offset, offset + count);

          setPosts(selectedPosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [data.postsCount, data.skipCount]);

  if (loading) {
    return (
      <Section background={data.background}>
        <div className='container'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Loading posts...</p>
          </div>
        </div>
      </Section>
    );
  }

  if (!posts.length) {
    return null; // Don't render if no posts
  }

  return (
    <Section background={data.background} className='pt-4 md:pt-6'>
      <div className='container max-w-4xl mx-auto'>
        {/* Section Header */}
        {data.title && (
          <h2 data-tina-field={tinaField(data, 'title')} className='text-xl font-semibold uppercase tracking-wider text-foreground mb-8'>
            {data.title}
          </h2>
        )}

        {/* Posts List */}
        <div className='space-y-8'>
          {posts.map((post) => (
            <Link key={post.id} href={post.url} className='group flex gap-6 hover:opacity-80 transition-opacity'>
              {/* Date Column */}
              <div className='flex-shrink-0 w-20 text-center'>
                <div className='text-4xl md:text-5xl font-bold text-foreground leading-none'>{post.dayOfMonth}</div>
                <div className='text-xs md:text-sm text-muted-foreground mt-1'>{post.monthYear}</div>
              </div>

              {/* Content Column */}
              <div className='flex-1 min-w-0 pt-1'>
                <h3 className='text-lg md:text-xl font-semibold text-foreground mb-2 group-hover:underline'>{post.title}</h3>
                {post.description && <p className='text-sm md:text-base text-muted-foreground line-clamp-2'>{post.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
};

export const latestPostsListBlockSchema: Template = {
  name: 'latestPostsList',
  label: 'Latest Posts List',
  ui: {
    defaultItem: {
      title: 'LATEST POSTS',
      postsCount: 5,
      skipCount: 4,
      background: 'bg-default',
    },
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: 'string',
      label: 'Title',
      name: 'title',
    },
    {
      type: 'number',
      label: 'Number of Posts to Display',
      name: 'postsCount',
      ui: {
        validate: (value) => {
          if (value && (value < 1 || value > 20)) {
            return 'Number of posts must be between 1 and 20';
          }
        },
      },
    },
    {
      type: 'number',
      label: 'Skip First N Posts',
      name: 'skipCount',
      description: 'Number of recent posts to skip (e.g., 4 to skip the first 4 posts shown in Recent Posts)',
      ui: {
        validate: (value) => {
          if (value && (value < 0 || value > 50)) {
            return 'Skip count must be between 0 and 50';
          }
        },
      },
    },
  ],
};
