'use client';
import { iconSchema } from '@/tina/fields/icon';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { PageBlocksHero, PageBlocksHeroImage } from '../../tina/__generated__/types';
import { Icon } from '../icon';
import { Section, sectionBlockSchemaField } from '../layout/section';
import { AnimatedGroup } from '../motion-primitives/animated-group';
import { TextEffect } from '../motion-primitives/text-effect';
import { Button } from '../ui/button';
import HeroVideoDialog from '../ui/hero-video-dialog';
import { Transition } from 'motion/react';
const transitionVariants = {
  container: {
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.75,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      } as Transition,
    },
  },
};

import { cn } from '@/lib/utils';
import { getBackgroundClass } from '../layout/section';

export const Hero = ({ data }: { data: PageBlocksHero }) => {
  const bgClass = getBackgroundClass(data.background || undefined);

  // Use the selected image source explicitly as requested
  const imageSrc = '/uploads/media/NBP_8378.jpg';

  return (
    <div className={cn(bgClass, "w-full")}>
      <div className="relative overflow-hidden flex flex-col lg:block mx-auto max-w-7xl">

        {/* Content Container - Order 2 on mobile (text after image) */}
        <div className="relative z-30 px-6 pt-12 pb-12 lg:py-32 grid lg:grid-cols-2 gap-12 items-center order-2 lg:order-none">
          {/* Left Column: Text */}
          <div className="flex flex-col gap-6 text-left max-w-2xl lg:max-w-none mx-auto lg:mx-0">
            {data.headline && (
              <div data-tina-field={tinaField(data, 'headline')}>
                <TextEffect preset='fade-in-blur' speedSegment={0.3} as='h1' className='text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground'>
                  {data.headline!}
                </TextEffect>
              </div>
            )}
            {data.tagline && (
              <div data-tina-field={tinaField(data, 'tagline')}>
                <TextEffect per='line' preset='fade-in-blur' speedSegment={0.3} delay={0.5} as='p' className='text-lg md:text-xl text-muted-foreground leading-relaxed'>
                  {data.tagline!}
                </TextEffect>
              </div>
            )}

            <AnimatedGroup variants={transitionVariants} className='flex flex-wrap gap-4 mt-4'>
              {data.actions &&
                data.actions.map((action) => (
                  <div key={action!.label} data-tina-field={tinaField(action)} className='bg-background/50 backdrop-blur-sm rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5 shadow-sm'>
                    <Button asChild size='lg' variant={action!.type === 'link' ? 'ghost' : 'default'} className='rounded-xl px-6 text-base h-12'>
                      <Link href={action!.link!}>
                        {action?.icon && <Icon data={action?.icon} />}
                        <span className='text-nowrap'>{action!.label}</span>
                      </Link>
                    </Button>
                  </div>
                ))}
            </AnimatedGroup>
          </div>

          {/* Empty column for grid alignment on Desktop */}
          <div className="hidden lg:block"></div>
        </div>

        {/* Background Image Wrapper - Order 1 on mobile (image first) */}
        <div className="relative w-full h-[50vh] min-h-[300px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[55%] order-1 lg:order-none overflow-hidden">
          {/* Mobile/Tablet Simple Image (No Blur) */}
          <div className="block lg:hidden w-full h-full relative">
            <Image
              className="object-cover object-top h-full w-full"
              alt={data.image?.alt || 'Portrait'}
              src={imageSrc}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
            {/* Bottom fade for smooth transition to text */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Desktop Complex Image (With Blur & Mask) */}
          <div className="hidden lg:block w-full h-full relative">
            {/* Layer 1: Blurred Background */}
            <div className="absolute inset-0 z-0">
              <Image
                className="object-cover object-left-top h-full w-full blur-sm scale-110"
                alt={data.image?.alt || 'Portrait Background'}
                src={imageSrc}
                fill
                sizes="55vw"
                priority
                aria-hidden="true"
              />
            </div>

            {/* Layer 2: Sharp Subject with Linear Mask */}
            <div
              className="absolute inset-0 z-10"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 100%)'
              }}
            >
              <Image
                className="object-cover object-left-top h-full w-full"
                alt={data.image?.alt || 'Portrait'}
                src={imageSrc}
                fill
                sizes="55vw"
                priority
              />
            </div>

            {/* Gradient Overlays on top of everything to ensure text readability */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-background to-transparent z-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified ImageBlock for reference if needed, but we are using direct Image now for the hardcoded variants.
// Keeping this component definition if other parts file use it, but since I am replacing the Hero implementation, 
// and ImageBlock was only used inside Hero, I can remove it or keep it unused.
// I will remove it to keep the file clean as I am replacing the usage.


export const heroBlockSchema: Template = {
  name: 'hero',
  label: 'Hero',
  ui: {
    previewSrc: '/blocks/hero.png',
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: 'This Big Text is Totally Awesome',
      text: 'Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.',
    },
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: 'string',
      label: 'Headline',
      name: 'headline',
    },
    {
      type: 'string',
      label: 'Tagline',
      name: 'tagline',
    },
    {
      label: 'Actions',
      name: 'actions',
      type: 'object',
      list: true,
      ui: {
        defaultItem: {
          label: 'Action Label',
          type: 'button',
          icon: {
            name: "Tina",
            color: "white",
            style: "float",
          },
          link: '/',
        },
        itemProps: (item) => ({ label: item.label }),
      },
      fields: [
        {
          label: 'Label',
          name: 'label',
          type: 'string',
        },
        {
          label: 'Type',
          name: 'type',
          type: 'string',
          options: [
            { label: 'Button', value: 'button' },
            { label: 'Link', value: 'link' },
          ],
        },
        iconSchema as any,
        {
          label: 'Link',
          name: 'link',
          type: 'string',
        },
      ],
    },
    {
      type: 'object',
      label: 'Image',
      name: 'image',
      fields: [
        {
          name: 'src',
          label: 'Image Source',
          type: 'image',
        },
        {
          name: 'alt',
          label: 'Alt Text',
          type: 'string',
        },
        {
          name: 'videoUrl',
          label: 'Video URL',
          type: 'string',
          description: 'If using a YouTube video, make sure to use the embed version of the video URL',
        },
      ],
    },
  ],
};
