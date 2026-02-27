import { ctaBlockSchema } from '@/components/blocks/call-to-action';
import { calloutBlockSchema } from '@/components/blocks/callout';
import { contentBlockSchema } from '@/components/blocks/content';
import { featureBlockSchema } from '@/components/blocks/features';
import { heroBlockSchema } from '@/components/blocks/hero';
import { journeyBlockSchema } from '@/components/blocks/journey';
import { latestPostsListBlockSchema } from '@/components/blocks/latest-posts-list';
import { mermaidBlockSchema } from '@/components/blocks/mermaid';
import { recentPostsBlockSchema } from '@/components/blocks/recent-posts';
import { statsBlockSchema } from '@/components/blocks/stats';
import { tableOfContentsBlockSchema } from '@/components/blocks/table-of-contents';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import { videoBlockSchema } from '@/components/blocks/video';
import type { Collection } from 'tinacms';

const Page: Collection = {
  label: 'Pages',
  name: 'page',
  path: 'content/pages',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const filepath = document._sys.breadcrumbs.join('/');
      if (filepath === 'home') {
        return '/';
      }
      return `/${filepath}`;
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      description: 'The page title, used for SEO and browser tabs.',
      isTitle: true,
      required: true,
    },
    {
      type: 'object',
      list: true,
      name: 'blocks',
      label: 'Sections',
      ui: {
        visualSelector: true,
      },
      templates: [
        heroBlockSchema,
        calloutBlockSchema,
        featureBlockSchema,
        statsBlockSchema,
        ctaBlockSchema,
        contentBlockSchema,
        testimonialBlockSchema,
        videoBlockSchema,
        mermaidBlockSchema,
        recentPostsBlockSchema,
        latestPostsListBlockSchema,
        journeyBlockSchema,
        tableOfContentsBlockSchema,
      ],
    },
  ],
};

export default Page;
