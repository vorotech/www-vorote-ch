import type { Collection } from 'tinacms';

const Milestone: Collection = {
  label: 'Milestones',
  name: 'milestone',
  path: 'content/milestones',
  format: 'md',
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      label: 'Icon',
      name: 'icon',
      options: ['GraduationCap', 'Code2', 'Users', 'ShieldCheck'],
    },
    {
      type: 'string',
      label: 'Summary',
      name: 'summary',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'reference',
      label: 'Related Post',
      name: 'post',
      collections: ['post'],
    },
    {
      type: 'string',
      label: 'Link Title',
      name: 'linkTitle',
      description: 'The text to display for the deep-dive link (defaults to "Read Professional Deep-Dive").',
    },
    {
      type: 'number',
      label: 'Year',
      name: 'year',
    },
  ],
};

export default Milestone;
