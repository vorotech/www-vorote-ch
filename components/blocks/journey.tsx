'use client';
import React from 'react';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { Section, sectionBlockSchemaField } from '../layout/section';
import { JourneyRoadmap } from '../journey/journey-roadmap';

export const Journey = ({ data }: { data: any }) => {
  return (
    <Section background={data.background} noTopPadding>
      <div data-tina-field={tinaField(data, 'title')}>
        <JourneyRoadmap title={data.title} milestones={data.milestones} />
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
      type: 'object',
      label: 'Milestones',
      name: 'milestones',
      list: true,
      fields: [
        {
          type: 'reference',
          label: 'Milestone',
          name: 'milestone',
          collections: ['milestone'],
        },
      ],
    },
  ],
};
