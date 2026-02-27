'use client';
import client from '@/tina/__generated__/client';
import { format } from 'date-fns';
import Link from 'next/link';
import * as React from 'react';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { Section, sectionBlockSchemaField } from '../layout/section';

interface ResearchHubData {
  title?: string;
  tagline?: string;
  selectionMethod: 'tag' | 'manual';
  tag?: string;
  posts?: { post: { id: string } }[];
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
  tags?: string[];
}

export const ResearchHub = ({ data }: { data: ResearchHubData }) => {
  const [posts, setPosts] = React.useState<ProcessedPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        let allPosts: ProcessedPost[] = [];
        
        if (data.selectionMethod === 'tag') {
          const response = await client.queries.postConnection({
            sort: 'date',
            last: 100,
          });

          if (response.data?.postConnection.edges) {
            allPosts = response.data.postConnection.edges
              .map((postData) => {
                const post = postData!.node!;
                if (!post.tags?.includes(data.tag || 'AI Security')) return null;
                
                const date = new Date(post.date!);
                if (isNaN(date.getTime())) return null;

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
                  tags: post.tags as string[],
                };
              })
              .filter((post): post is ProcessedPost => post !== null);
          }
        } else if (data.selectionMethod === 'manual' && data.posts) {
          // Fetch manual posts by ID/path
          // For simplicity in this block, we'll fetch all and filter, 
          // but a better way would be individual queries if IDs are available.
          const postIds = data.posts.map(p => p.post.id);
          const response = await client.queries.postConnection({
            last: 100,
          });
          
          if (response.data?.postConnection.edges) {
            allPosts = response.data.postConnection.edges
              .map((postData) => {
                const post = postData!.node!;
                if (!postIds.includes(post.id)) return null;
                
                const date = new Date(post.date!);
                if (isNaN(date.getTime())) return null;

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
                  tags: post.tags as string[],
                };
              })
              .filter((post): post is ProcessedPost => post !== null);
              
            // Sort to match the manual order
            allPosts.sort((a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id));
          }
        }

        setPosts(allPosts);
      } catch (error) {
        console.error('Error fetching research posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [data.selectionMethod, data.tag, data.posts]);

  if (loading) {
    return (
      <Section background={data.background}>
        <div className='container'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Loading research materials...</p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section background={data.background} className='pt-8 md:pt-12'>
      <div className='container max-w-6xl mx-auto'>
        {/* Header */}
        <div className="mb-12 border-l-4 border-primary pl-6">
          {data.title && (
            <h2 data-tina-field={tinaField(data, 'title')} className='text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 uppercase'>
              {data.title}
            </h2>
          )}
          {data.tagline && (
            <p data-tina-field={tinaField(data, 'tagline')} className='text-lg md:text-xl text-muted-foreground max-w-2xl'>
              {data.tagline}
            </p>
          )}
        </div>

        {/* Grid of Posts */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={post.url} 
              className='group flex flex-col bg-card hover:bg-accent/50 border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg'
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                    {post.monthYear}
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground/30">
                    {post.dayOfMonth}
                  </div>
                </div>
                
                <h3 className='text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2'>
                  {post.title}
                </h3>
                
                {post.description && (
                  <p className='text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow'>
                    {post.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          
          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-muted rounded-xl">
              <p className="text-muted-foreground">No research materials found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

export const researchHubBlockSchema: Template = {
  name: 'researchHub',
  label: 'Research Hub',
  ui: {
    defaultItem: {
      title: 'Technical Library',
      tagline: 'Deep dives into AI security, infrastructure, and architectural patterns.',
      selectionMethod: 'tag',
      tag: 'AI Security',
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
      type: 'string',
      label: 'Tagline',
      name: 'tagline',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'string',
      label: 'Selection Method',
      name: 'selectionMethod',
      options: [
        { label: 'By Tag', value: 'tag' },
        { label: 'Manual Selection', value: 'manual' },
      ],
    },
    {
      type: 'string',
      label: 'Filter by Tag',
      name: 'tag',
      ui: {
        condition: (form, values) => values.selectionMethod === 'tag',
      },
    },
    {
      type: 'object',
      label: 'Manual Posts',
      name: 'posts',
      list: true,
      ui: {
        condition: (form, values) => values.selectionMethod === 'manual',
        itemProps: (item) => ({ label: item.post }),
      },
      fields: [
        {
          type: 'reference',
          label: 'Post',
          name: 'post',
          collections: ['post'],
        },
      ],
    },
  ],
};
