import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedGroup, PresetType } from '@/components/motion-primitives/animated-group';
import { GridPattern } from '@/components/magicui/grid-pattern';

interface SectionProps extends React.HTMLProps<HTMLElement> {
  background?: string;
  children: ReactNode;
  showGrid?: boolean;
  preset?: PresetType;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
}

export const getBackgroundClass = (bgClass: string | undefined): string => {
  if (!bgClass || bgClass === 'bg-default') return 'bg-background';

  // Handle various specific keys
  const mapping: Record<string, string> = {
    "bg-white/80": "bg-white/80 dark:bg-zinc-950/80",
    "bg-zinc-50": "bg-zinc-50 dark:bg-zinc-950",
    "bg-black/80": "bg-black/80 dark:bg-black/50", // Already dark, but maybe adjustment?
  };

  if (mapping[bgClass]) return mapping[bgClass];

  // Generic handler for bg-{color}-50/80 pattern
  const match = bgClass.match(/^bg-([a-z]+)-50\/80$/);
  if (match) {
    // Return a subtle white overlay in dark mode with light text for readability
    return `${bgClass} dark:bg-white/10 dark:text-gray-100`;
  }

  return bgClass;
};

export const Section: React.FC<SectionProps> = ({ 
  className, 
  children, 
  background, 
  showGrid = false,
  preset = 'fade',
  noTopPadding = false,
  noBottomPadding = false,
  ...props 
}) => {
  const bgClass = getBackgroundClass(background);
  
  return (
    <div className={cn("relative overflow-hidden", bgClass)}>
      {showGrid && (
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          )}
        />
      )}
      <section
        className={cn(
          "py-12 mx-auto max-w-7xl px-6 relative z-10", 
          noTopPadding && "pt-0",
          noBottomPadding && "pb-0",
          className
        )}
        {...props}
      >
        <AnimatedGroup preset={preset}>
          {children}
        </AnimatedGroup>
      </section>
    </div>
  );
};

export const tailwindBackgroundOptions = [
  { label: "Default", value: "bg-default" },
  { label: "White", value: "bg-white/80" },
  { label: "Gray", value: "bg-gray-50/80" },
  { label: "Zinc", value: "bg-zinc-50" },
  { label: "Black", value: "bg-black/80" },
  { label: "Red", value: "bg-red-50/80" },
  { label: "Orange", value: "bg-orange-50/80" },
  { label: "Yellow", value: "bg-yellow-50/80" },
  { label: "Green", value: "bg-green-50/80" },
  { label: "Lime", value: "bg-lime-50/80" },
  { label: "Emerald", value: "bg-emerald-50/80" },
  { label: "Teal", value: "bg-teal-50/80" },
  { label: "Cyan", value: "bg-cyan-50/80" },
  { label: "Blue", value: "bg-blue-50/80" },
  { label: "Sky", value: "bg-sky-50/80" },
  { label: "Indigo", value: "bg-indigo-50/80" },
  { label: "Violet", value: "bg-violet-50/80" },
  { label: "Purple", value: "bg-purple-50/80" },
  { label: "Fuchsia", value: "bg-fuchsia-50/80" },
  { label: "Pink", value: "bg-pink-50/80" },
  { label: "Rose", value: "bg-rose-50/80" },
];

export const sectionBlockSchemaField = {
  type: "string",
  label: "Background",
  name: "background",
  options: tailwindBackgroundOptions,
};
