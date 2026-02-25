'use client';
import React from 'react';

import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { PageBlocksContent } from '../../tina/__generated__/types';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { ScriptCopyBtn, scriptCopyBlockSchema } from '../magicui/script-copy-btn';
import { Mermaid } from './mermaid';
import { TBody, TD, TH, THead, TR, Table } from './table';

export const Content = ({ data }: { data: PageBlocksContent }) => {
  return (
    <Section background={data.background!} className='prose dark:prose-invert prose-lg' data-tina-field={tinaField(data, 'body')}>
      <TinaMarkdown
        content={data.body}
        components={{
          mermaid: (props: any) => <Mermaid {...props} />,
          scriptCopyBlock: (props: any) => <ScriptCopyBtn {...props} />,
          table: (props: any) => <Table {...props} />,
          thead: (props: any) => <THead {...props} />,
          tbody: (props: any) => <TBody {...props} />,
          tr: (props: any) => <TR {...props} />,
          th: (props: any) => <TH {...props} />,
          td: (props: any) => <TD {...props} />,
        }}
      />
    </Section>
  );
};

export const contentBlockSchema: Template = {
  name: 'content',
  label: 'Content',
  ui: {
    previewSrc: '/blocks/content.png',
    defaultItem: {
      body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.',
    },
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: 'rich-text',
      label: 'Body',
      name: 'body',
      templates: [scriptCopyBlockSchema],
      isBody: true,
    },
  ],
};
