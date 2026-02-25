import dynamic from 'next/dynamic';
import type { Template } from 'tinacms';

const MermaidElement = dynamic(() => import('../mermaid-renderer'), {
  ssr: false,
  loading: () => <div className='animate-pulse bg-gray-100 h-32 w-full rounded my-8 flex items-center justify-center text-gray-400'>Loading diagram...</div>,
});

export function Mermaid(props: { value: string }) {
  if (!props?.value) return null;
  return <MermaidElement value={props.value} />;
}

export const mermaidBlockSchema: Template = {
  name: 'mermaid',
  label: 'Mermaid Diagram',
  ui: {
    defaultItem: {
      value: 'graph TD;\n  A-->B;',
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Mermaid Code',
      name: 'value',
      ui: {
        component: 'textarea',
      },
    },
  ],
};
