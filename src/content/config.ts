import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    heroImg: z.string().optional(),
    excerpt: z.string().optional(),
    author: z.string().default('Dmytro'),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

const milestones = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.string().or(z.number()),
    icon: z.string().optional(),
    summary: z.string().optional(),
    post: z.string().optional(),
    description: z.string().optional(),
    position: z.number().optional(),
  }),
});

const authors = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }),
});

const tags = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
  }),
});

export const collections = { posts, pages, milestones, authors, tags };
