import { ClientProviders } from '@/components/layout/client-providers';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { Abel, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import '@/styles.css';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { TailwindIndicator } from '@/components/ui/breakpoint-indicator';

// Source Code Pro for body text
const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  weight: '300',
});

// Abel for headings
const abel = Abel({
  subsets: ['latin'],
  variable: '--font-abel',
  weight: '400',
});

export const metadata: Metadata = {
  title: {
    default: "Dmytro's Radar",
    template: `Dmytro's Radar | %s`,
  },
  description: "Dmytro's Radar - Personal Blog & Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning className={cn(sourceCodePro.variable, abel.variable)}>
      <body suppressHydrationWarning className='min-h-screen bg-background font-sans antialiased relative'>
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className={cn('[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]', 'opacity-50')}
        />
        <ClientProviders>
          <div className='relative z-10'>{children}</div>
        </ClientProviders>
        <TailwindIndicator />
      </body>
    </html>
  );
}
