import { mermaidBlockSchema } from '@/components/blocks/mermaid';
import { tableOfContentsBlockSchema } from '@/components/blocks/table-of-contents';
import { videoBlockSchema } from '@/components/blocks/video';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import type { Collection } from 'tinacms';

const Post: Collection = {
  label: 'Blog Posts',
  name: 'post',
  path: 'content/posts',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      return `/posts/${document._sys.breadcrumbs.join('/')}`;
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'image',
      name: 'heroImg',
      label: 'Hero Image',
      // @ts-ignore
      uploadDir: () => 'posts',
    },
    {
      type: 'rich-text',
      label: 'Excerpt',
      name: 'excerpt',
      overrides: {
        toolbar: ['bold', 'italic', 'link'],
      },
    },
    {
      type: 'reference',
      label: 'Author',
      name: 'author',
      collections: ['author'],
      ui: {
        //@ts-ignore
        optionComponent: (
          props: {
            name?: string;
            avatar: string;
          },
          _internalSys: { path: string }
        ) => {
          const { name, avatar } = props;
          if (!name) return _internalSys.path;

          return (
            <p className='flex min-h-8 items-center gap-4'>
              <Avatar>
                {avatar && <AvatarImage src={avatar} alt={`${name} Profile`} />}
                <AvatarFallback>
                  {name
                    .split(' ')
                    .map((part) => part[0]?.toUpperCase() || '')
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {name}
            </p>
          );
        },
      },
    },
    {
      type: 'datetime',
      label: 'Posted Date',
      name: 'date',
      ui: {
        dateFormat: 'MMMM DD YYYY',
        timeFormat: 'hh:mm A',
      },
    },
    {
      type: 'object',
      label: 'Tags',
      name: 'tags',
      list: true,
      fields: [
        {
          type: 'reference',
          label: 'Tag',
          name: 'tag',
          collections: ['tag'],
          ui: {
            optionComponent: (
              props: {
                name?: string;
              },
              _internalSys: { path: string }
            ) => props.name || _internalSys.path,
          },
        },
      ],
      ui: {
        itemProps: (item) => {
          return { label: item?.tag };
        },
      },
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      templates: [
        {
          name: 'BlockQuote',
          label: 'Block Quote',
          fields: [
            {
              name: 'children',
              label: 'Quote',
              type: 'rich-text',
              overrides: {
                toolbar: ['bold', 'italic', 'link'],
              },
            },
            {
              name: 'authorName',
              label: 'Author',
              type: 'string',
            },
          ],
        },
        {
          name: 'DateTime',
          label: 'Date & Time',
          inline: true,
          fields: [
            {
              name: 'format',
              label: 'Format',
              type: 'string',
              options: ['utc', 'iso', 'local'],
            },
          ],
        },
        {
          name: 'NewsletterSignup',
          label: 'Newsletter Sign Up',
          fields: [
            {
              name: 'children',
              label: 'CTA',
              type: 'rich-text',
            },
            {
              name: 'placeholder',
              label: 'Placeholder',
              type: 'string',
            },
            {
              name: 'buttonText',
              label: 'Button Text',
              type: 'string',
            },
            {
              name: 'disclaimer',
              label: 'Disclaimer',
              type: 'rich-text',
              overrides: {
                toolbar: ['bold', 'italic', 'link'],
              },
            },
          ],
          ui: {
            defaultItem: {
              placeholder: 'Enter your email',
              buttonText: 'Notify Me',
            },
          },
        },
        {
          name: 'FeaturedLink',
          label: 'Mention / Featured Link',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'string',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'rich-text',
              overrides: {
                toolbar: ['bold', 'italic'],
              },
            },
            {
              name: 'url',
              label: 'URL',
              type: 'string',
              required: true,
            },
            {
              name: 'icon',
              label: 'Icon',
              type: 'string',
              options: [
                { value: 'tools', label: 'Tools' },
                { value: 'cyber', label: 'Cyber / Security' },
                { value: 'users', label: 'Users / Community' },
                { value: 'ai', label: 'AI / Intelligence' },
                { value: 'gears', label: 'Gears / System' },
                { value: 'bug', label: 'Bug / Vulnerability' },
                { value: 'report', label: 'Report / Analysis' },
                { value: 'external', label: 'External Link' },
              ],
            },
            {
              name: 'openInNewTab',
              label: 'Open in New Tab',
              type: 'boolean',
            },
          ],
          ui: {
            defaultItem: {
              title: 'Project Name',
              url: 'https://github.com/',
              icon: 'external',
              openInNewTab: true,
            },
          },
        },
        videoBlockSchema,
        mermaidBlockSchema,
        tableOfContentsBlockSchema,
      ],
      isBody: true,
    },
  ],
};

export default Post;
