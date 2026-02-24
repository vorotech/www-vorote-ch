'use client';

import React, { useEffect, useState, useId, useRef } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface MermaidProps {
  value: string;
}

const MermaidInner: React.FC<MermaidProps> = ({ value: content }) => {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, ''); // Mermaid IDs can't contain colons

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftIndicator(scrollLeft > 10);
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

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
        
        // Inject responsive attributes into the SVG
        const responsiveSvg = renderedSvg
          .replace(/<svg /, '<svg style="max-width: 100%; height: auto;" ')
          .replace(/width="[^"]*"/, '')
          .replace(/height="[^"]*"/, '');

        setSvg(responsiveSvg);
        setError(null);
        // Reset scroll indicators after new render
        setTimeout(handleScroll, 100);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError('Failed to render diagram. Please check your Mermaid syntax.');
      }
    };

    renderDiagram();
  }, [content, resolvedTheme, id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      handleScroll();
      return () => {
        el.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [svg]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullScreen]);

  if (error) {
    return (
      <div className="mermaid-error my-6 p-4 border border-red-200 rounded bg-red-50 text-red-700 text-sm">
        <p className="font-semibold mb-2">{error}</p>
        <pre className="text-xs overflow-x-auto p-2 bg-white/50 rounded">{content}</pre>
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative my-8 w-full transition-all duration-300",
      isFullScreen ? "fixed inset-0 z-50 bg-background/95 p-4 md:p-10 flex flex-col backdrop-blur-md" : "flex flex-col items-center"
    )}>
      <div className="absolute right-0 top-0 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full shadow-md"
          onClick={() => setIsFullScreen(!isFullScreen)}
        >
          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div 
        ref={scrollRef}
        className={cn(
          "mermaid-wrapper content-scroll-container transition-opacity duration-300",
          showLeftIndicator && "scroll-indicator-left",
          showRightIndicator && "scroll-indicator-right",
          isFullScreen ? "flex-1 flex items-center justify-center p-8" : "flex justify-center"
        )}
        style={{ opacity: svg ? 1 : 0 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      
      {isFullScreen && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Click the minimize icon or press ESC to exit full screen view.
        </div>
      )}
    </div>
  );
};

// Wrap with dynamic to prevent SSR issues and hydration mismatches
const MermaidElement = dynamic(() => Promise.resolve(MermaidInner), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-32 w-full rounded my-8 flex items-center justify-center text-gray-400">Loading diagram...</div>
});

export default MermaidElement;
