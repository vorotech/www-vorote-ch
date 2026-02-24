'use client';

import React, { useEffect, useState, useId } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

interface MermaidProps {
  value: string;
}

const MermaidInner: React.FC<MermaidProps> = ({ value: content }) => {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const id = useId().replace(/:/g, ''); // Mermaid IDs can't contain colons

  useEffect(() => {
    // Client-side initialization for mermaid
    const initMermaid = async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
        // Support for higher fidelity rendering
        flowchart: { htmlLabels: true, curve: 'basis' },
        gantt: { useMaxWidth: true },
      });
    };
    initMermaid();
  }, [resolvedTheme]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!content) {
        setSvg('');
        return;
      }

      try {
        const mermaid = (await import('mermaid')).default;
        // Generate a unique ID for each render to avoid collisions during rapid Tina re-renders
        const renderId = `mermaid-${id}-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(renderId, content);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError('Failed to render diagram. Please check your Mermaid syntax.');
      }
    };

    renderDiagram();
  }, [content, resolvedTheme, id]);

  if (error) {
    return (
      <div className="mermaid-error my-6 p-4 border border-red-200 rounded bg-red-50 text-red-700 text-sm">
        <p className="font-semibold mb-2">{error}</p>
        <pre className="text-xs overflow-x-auto p-2 bg-white/50 rounded">{content}</pre>
      </div>
    );
  }

  return (
    <div 
      className="mermaid-wrapper flex justify-center my-8 overflow-x-auto w-full transition-opacity duration-300"
      style={{ opacity: svg ? 1 : 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

// Wrap with dynamic to prevent SSR issues and hydration mismatches
const MermaidElement = dynamic(() => Promise.resolve(MermaidInner), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-32 w-full rounded my-8 flex items-center justify-center text-gray-400">Loading diagram...</div>
});

export default MermaidElement;
