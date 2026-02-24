'use client';

import React, { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';

// Keep a singleton highlighter promise to avoid re-creating it
let highlighterPromise: Promise<any> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    // Dynamic import to keep bundle small
    const { createHighlighter } = await import('shiki');
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: [
        'typescript',
        'javascript',
        'bash',
        'json',
        'yaml',
        'rust',
        'go',
        'python',
        'tsx',
        'jsx',
        'markdown',
        'mdx',
        'text'
      ],
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

  // Map common language aliases or fallback to text
  const getLanguage = (l?: string) => {
    if (!l) return 'text';
    const low = l.toLowerCase();
    const common: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'sh': 'bash',
      'yml': 'yaml',
    };
    return common[low] || low;
  };

  const language = getLanguage(lang);

  useEffect(() => {
    let isMounted = true;
    async function highlight() {
      try {
        const highlighter = await getHighlighter();
        const html = highlighter.codeToHtml(value, {
          lang: language,
          theme: 'github-dark',
        });
        if (isMounted) setHighlightedHtml(html);
      } catch (err) {
        console.error('Shiki error:', err);
        if (isMounted) setHighlightedHtml(null);
      }
    }
    highlight();
    return () => { isMounted = false; };
  }, [value, language]);

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
    <div className="relative group my-6 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          onClick={copyToClipboard}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto text-sm leading-relaxed">
        {highlightedHtml ? (
          <div 
            className="[&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!font-mono selection:bg-teal-500/20"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
          />
        ) : (
          <pre className="text-zinc-300 m-0 p-0 font-mono selection:bg-teal-500/20">
            <code>{value}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
