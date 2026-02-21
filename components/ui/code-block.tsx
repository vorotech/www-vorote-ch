'use client';

import React, { useState } from 'react';
import { Prism } from 'tinacms/dist/rich-text/prism';
import { Check, Copy } from 'lucide-react';
import { Button } from './button';

interface CodeBlockProps {
  lang?: string;
  value: string;
}

export const CodeBlock = ({ lang, value }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 [&_pre]:!my-0">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={copyToClipboard}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="rounded-lg overflow-hidden">
          <Prism lang={lang} value={value} />
      </div>
    </div>
  );
};
