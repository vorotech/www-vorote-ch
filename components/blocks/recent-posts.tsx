'use client';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { Section, sectionBlockSchemaField } from '../layout/section';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowRight, UserRound } from 'lucide-react';
import { PageBlocksRecent } from '@/tina/__generated__/types';
import client from '@/tina/__generated__/client';

interface ProcessedPost {
  id: string;
  published: string;
  title: string;
  tags: (string | undefined)[];
  url: string;
  excerpt: TinaMarkdownContent;
  heroImg?: string | null;
  author: {
    name: string;
    avatar?: string | null;
  };
}

export const RecentPosts = ({ data }: { data: PageBlocksRecent }) => {
  const [posts, setPosts] = React.useState<ProcessedPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await client.queries.postConnection({
          sort: 'date',
          last: data.postsCount || 4,
        });

        if (response.data?.postConnection.edges) {
          const processedPosts = response.data.postConnection.edges
            .map((postData) => {
              const post = postData!.node!;
              const date = new Date(post.date!);
              let formattedDate = '';
              if (!isNaN(date.getTime())) {
                formattedDate = format(date, 'MMM dd, yyyy');
              }

              return {
                id: post.id,
                published: formattedDate,
                title: post.title,
                tags: post.tags?.map((tag) => tag?.tag?.name) || [],
                url: `/posts/${post._sys.breadcrumbs.join('/')}`,
                excerpt: post.excerpt,
                heroImg: post.heroImg,
                author: {
                  name: post.author?.name || 'Anonymous',
                  avatar: post.author?.avatar,
                }
              };
            });

          setPosts(processedPosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [data.postsCount]);

  if (loading) {
    return (
      <Section>
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">Loading posts...</h2>
          </div>
        </div>
      </Section>
    );
  }

  if (!posts.length) {
    return (
      <Section>
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">No posts found</h2>
          </div>
        </div>
      </Section>
    );
  }

  const [featuredPost, ...otherPosts] = posts;

  return (
    // Added negative margins to compensate for prose spacing
    <div className="my-8">
      <Section>
        <div className="container">
          {/* Section Header */}
          {(data.title || data.description) && (
            <div className="text-center mb-12 lg:mb-16">
              {data.title && (
                <h2 
                  data-tina-field={tinaField(data, 'title')} 
                  className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-4"
                >
                  {data.title}
                </h2>
              )}
              {data.description && (
                <p 
                  data-tina-field={tinaField(data, 'description')} 
                  className="text-muted-foreground md:text-lg max-w-2xl mx-auto"
                >
                  {data.description}
                </p>
              )}
            </div>
          )}

          {/* Featured Post - Full Width */}
          <div className="mb-12 lg:mb-16">
            <Card className="overflow-hidden border-0 bg-transparent shadow-none py-0">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Featured Post Image */}
                {featuredPost.heroImg && (
                  <div className="lg:order-first">
                    <Link href={featuredPost.url} className="block">
                      <div className="aspect-[16/10] overflow-clip rounded-lg border border-border">
                        <Image
                          width={600}
                          height={375}
                          src={featuredPost.heroImg}
                          alt={featuredPost.title}
                          className="h-full w-full object-cover transition-opacity duration-200 hover:opacity-90"
                        />
                      </div>
                    </Link>
                  </div>
                )}

                {/* Featured Post Content */}
                <div className="flex flex-col justify-center">
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                      {featuredPost.tags.map((tag, index) => (
                        <span key={index}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold md:text-3xl lg:text-4xl mb-4">
                    <Link href={featuredPost.url} className="hover:underline">
                      {featuredPost.title}
                    </Link>
                  </h3>

                  <div className="text-muted-foreground mb-6 text-lg">
                    <TinaMarkdown content={featuredPost.excerpt} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {featuredPost.published}
                    </div>

                    <Link
                      href={featuredPost.url}
                      className="group inline-flex items-center font-semibold hover:underline"
                    >
                      <span>Read more</span>
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Other Posts - 3 Column Grid */}
          {otherPosts.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {otherPosts.map((post) => (
                <Card key={post.id} className="group overflow-hidden border-0 bg-transparent shadow-none py-0">
                  {/* Post Image */}
                  {post.heroImg && (
                    <div className="mb-4">
                      <Link href={post.url} className="block">
                        <div className="aspect-[16/10] overflow-clip rounded-lg border border-border">
                          <Image
                            width={400}
                            height={250}
                            src={post.heroImg}
                            alt={post.title}
                            className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                          />
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Post Content */}
                  <div>
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <span key={index}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold md:text-xl mb-3">
                      <Link href={post.url} className="hover:underline">
                        {post.title}
                      </Link>
                    </h4>

                    <div className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      <TinaMarkdown content={post.excerpt} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{post.published}</span>

                      <Link
                        href={post.url}
                        className="group inline-flex items-center font-semibold hover:underline mr-1 text-base"
                      >
                        Read more
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div> 
  );
};

export const recentPostsBlockSchema: Template = {
  name: 'recent',
  label: 'Recent Posts',
  ui: {
    previewSrc: '/blocks/recent-posts.png',
    defaultItem: {
      title: 'Latest Blog Posts',
      description: 'Discover our most recent insights and updates',
      postsCount: 4,
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
      label: 'Description',
      name: 'description',
    },
    {
      type: 'number',
      label: 'Number of Posts',
      name: 'postsCount',
      ui: {
        validate: (value) => {
          if (value && (value < 1 || value > 10)) {
            return 'Number of posts must be between 1 and 10';
          }
        },
      },
    },
  ],
};
