'use client';

import { Check, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from './button';

// Keep a singleton highlighter promise to avoid re-creating it
let highlighterPromise: Promise<any> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    // Dynamic import to keep bundle small
    const { createHighlighter } = await import('shiki');
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['typescript', 'javascript', 'bash', 'json', 'yaml', 'rust', 'go', 'python', 'tsx', 'jsx', 'markdown', 'mdx', 'text'],
    });
  }
  return highlighterPromise;
}

interface CodeBlockProps {
  lang?: string;
  value: string;
}

export const CodeBlock = ({ lang = 'text', value }: CodeBlockProps) => {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Map common language aliases or fallback to text
  const getLanguage = (l?: string) => {
    if (!l) return 'text';
    const low = l.toLowerCase();
    const common: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      sh: 'bash',
      yml: 'yaml',
    };
    return common[low] || low;
  };

  const language = getLanguage(lang);

  useEffect(() => {
    if (!hasMounted) return;
    let isMounted = true;
    async function highlight() {
      try {
        const highlighter = await getHighlighter();
        const theme = resolvedTheme === 'dark' ? 'github-dark' : 'github-light';
        const html = highlighter.codeToHtml(value, {
          lang: language,
          theme: theme,
        });
        if (isMounted) setHighlightedHtml(html);
      } catch (err) {
        console.error('Shiki error:', err);
        if (isMounted) setHighlightedHtml(null);
      }
    }
    highlight();
    return () => {
      isMounted = false;
    };
  }, [value, language, resolvedTheme, hasMounted]);

  const copyToClipboard = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className='relative group my-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden shadow-xl transition-colors duration-300'>
      {/* Header with language and copy button */}
      <div className='flex items-center justify-between px-4 py-1.5 bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-sm'>
        <span className='text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-widest'>{language}</span>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors'
          onClick={copyToClipboard}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check className='h-3.5 w-3.5 text-green-600 dark:text-green-500' /> : <Copy className='h-3.5 w-3.5' />}
        </Button>
      </div>

      {/* Code Area */}
      <div className='p-4 overflow-x-auto text-sm leading-relaxed min-h-[4rem]'>
        {!hasMounted ? (
          <div className='animate-pulse bg-zinc-200/20 dark:bg-zinc-800/20 h-10 w-full rounded' />
        ) : highlightedHtml ? (
          <div
            className='[&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!font-mono selection:bg-teal-500/20'
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className='text-zinc-700 dark:text-zinc-300 m-0 p-0 font-mono selection:bg-teal-500/20'>
            <code>{value}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
