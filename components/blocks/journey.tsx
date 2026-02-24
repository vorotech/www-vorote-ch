'use client';
import React from 'react';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { Section, sectionBlockSchemaField } from '../layout/section';

export const Journey = ({ data }: { data: any }) => {
  return (
    <Section background={data.background}>
      <div className='max-w-4xl mx-auto py-12'>
        <h2
          data-tina-field={tinaField(data, 'title')}
          className='text-3xl font-bold mb-8 text-center'
        >
          {data.title}
        </h2>
        <div className='bg-muted/50 p-8 rounded-lg text-center border-2 border-dashed border-muted-foreground/20'>
          <p className='text-xl font-medium'>Journey Roadmap Content Placeholder</p>
          <p className='text-muted-foreground mt-2'>
            Milestones selected: {data.milestones?.length || 0}
          </p>
          <div className='mt-4 flex flex-wrap justify-center gap-2'>
            {data.milestones?.map((m: any, i: number) => (
              <span key={i} className='px-3 py-1 bg-background rounded-full text-xs border'>
                Milestone {i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export const journeyBlockSchema: Template = {
  name: 'journey',
  label: 'Journey Roadmap',
  ui: {
    defaultItem: {
      title: 'My Professional Journey',
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
      type: 'reference',
      label: 'Milestones',
      name: 'milestones',
      collections: ['milestone'],
      list: true,
    },
  ],
};
