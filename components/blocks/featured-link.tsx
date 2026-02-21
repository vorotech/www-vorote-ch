'use client';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { Card } from '../ui/card';


interface FeaturedLinkProps {
  title: string;
  description?: TinaMarkdownContent;
  url: string;
  bannerImage?: string;
  backgroundColor?: 'blue' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple' | 'gray' | 'white';
  textColor?: 'blue' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple' | 'gray' | 'white' | 'black';
  openInNewTab?: boolean;
}

export const FeaturedLink = ({
  title,
  description,
  url,
  bannerImage,
  backgroundColor = 'gray',
  textColor = 'white',
  openInNewTab = true
}: FeaturedLinkProps) => {
  const linkProps = {
    href: url,
    target: openInNewTab ? '_blank' : undefined,
    rel: openInNewTab ? 'noopener noreferrer' : undefined,
  };

  // Color mapping for background colors
  const bgColorClasses = {
    blue: 'bg-blue-500',
    teal: 'bg-teal-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500',
    white: 'bg-white',
  };

  // Color mapping for text colors
  const textColorClasses = {
    blue: 'text-blue-500',
    teal: 'text-teal-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    pink: 'text-pink-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500',
    white: 'text-white',
    black: 'text-black',
  };

  return (
    <div>
      <Link {...linkProps} className="block group no-underline">
        {/* py-0 компенсує базовий py-6 клас Card компонента для усунення білих областей */}
        <Card className="overflow-hidden hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 rounded-lg !p-0 !gap-0">
          <div className="relative aspect-[16/4] overflow-hidden"> {/* Видалено rounded-lg звідси */}
            {/* Banner Image or Color Background */}
            {bannerImage ? (
              <>
                <Image
                  src={bannerImage}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110 not-prose"
                />
                {/* Light overlay for better text readability with hover effect */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
              </>
            ) : (
              <>
                <div className="absolute inset-0" style={{ backgroundColor: bgColorClasses[backgroundColor] ? undefined : (backgroundColor === 'white' ? 'white' : 'gray') }}>
                  {/* Tailwind classes are preferred, but direct style as fallback/for custom colors */}
                  <div className={`${bgColorClasses[backgroundColor] || 'bg-gray-500'} absolute inset-0 group-hover:brightness-110 transition-all duration-300`} />
                </div>
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 group-hover:to-black/10 transition-all duration-300" />
              </>
            )}

            {/* Content Overlay with improved spacing */}
            <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8 lg:p-10">
              <div className="max-w-3xl">
                <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 leading-tight ${
                  textColorClasses[textColor] || 'text-white'
                }`}
                style={{
                  textShadow: bannerImage ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
                }}>
                  {title}{' '}
                  <ArrowRight className="inline w-5 h-5 md:w-6 md:h-6 ml-2 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </h3>

                {description && (
                  <div className="text-base md:text-lg lg:text-xl line-clamp-2 leading-relaxed max-w-2xl"
                       style={{
                         textShadow: bannerImage ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
                       }}>
                    <div 
                      className="prose max-w-none [&>p]:mb-0 [&>p]:leading-relaxed [&>*]:!text-inherit"
                      style={{
                        // Force text color for all prose elements
                        color: textColor === 'white' ? '#ffffff' : 
                               textColor === 'black' ? '#000000' :
                               textColor === 'blue' ? '#3b82f6' :
                               textColor === 'teal' ? '#14b8a6' :
                               textColor === 'green' ? '#22c55e' :
                               textColor === 'yellow' ? '#eab308' :
                               textColor === 'orange' ? '#f97316' :
                               textColor === 'red' ? '#ef4444' :
                               textColor === 'pink' ? '#ec4899' :
                               textColor === 'purple' ? '#a855f7' :
                               textColor === 'gray' ? '#6b7280' :
                               '#ffffff'
                      }}>
                      <TinaMarkdown content={description} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};
