import React from 'react';
import * as BoxIcons from 'react-icons/bi';
import { FaFacebookF, FaGithub, FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { AiFillInstagram } from 'react-icons/ai';

export const IconOptions: Record<string, React.FC<any>> = {
  ...BoxIcons,
  FaFacebookF,
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaYoutube,
  AiFillInstagram,
};

const iconColorClass: Record<string, { regular: string; circle: string }> = {
  blue: {
    regular: 'text-blue-400',
    circle: 'bg-blue-400 dark:bg-blue-500 text-blue-50',
  },
  teal: {
    regular: 'text-teal-400',
    circle: 'bg-teal-400 dark:bg-teal-500 text-teal-50',
  },
  green: {
    regular: 'text-green-400',
    circle: 'bg-green-400 dark:bg-green-500 text-green-50',
  },
  red: {
    regular: 'text-red-400',
    circle: 'bg-red-400 dark:bg-red-500 text-red-50',
  },
  pink: {
    regular: 'text-pink-400',
    circle: 'bg-pink-400 dark:bg-pink-500 text-pink-50',
  },
  purple: {
    regular: 'text-purple-400',
    circle: 'bg-purple-400 dark:bg-purple-500 text-purple-50',
  },
  orange: {
    regular: 'text-orange-400',
    circle: 'bg-orange-400 dark:bg-orange-500 text-orange-50',
  },
  yellow: {
    regular: 'text-yellow-400',
    circle: 'bg-yellow-400 dark:bg-yellow-500 text-yellow-50',
  },
  white: {
    regular: 'text-white opacity-80',
    circle: 'bg-white-400 dark:bg-white-500 text-white-50',
  },
};

const iconSizeClass: Record<string, string> = {
  xs: 'w-6 h-6 shrink-0',
  small: 'w-8 h-8 shrink-0',
  medium: 'w-12 h-12 shrink-0',
  large: 'w-14 h-14 shrink-0',
  xl: 'w-16 h-16 shrink-0',
  custom: '',
};

interface IconProps {
  data?: {
    name?: string | null;
    color?: string | null;
    size?: string | number | null;
    style?: string | null;
  } | null;
  parentColor?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ data, parentColor = '', className = '' }) => {
  if (!data || !data.name || !IconOptions[data.name]) {
    return null;
  }

  const { name, color, size = 'medium', style = 'regular' } = data;
  const IconSVG = IconOptions[name];
  const sizeKey = size || 'medium';
  const iconSizeClasses = typeof sizeKey === 'string' ? (iconSizeClass[sizeKey] || iconSizeClass.medium) : iconSizeClass.medium;

  const themeColor = 'teal';
  const iconColor = color ? (color === 'primary' ? themeColor : color) : themeColor;
  const colorData = iconColorClass[iconColor] || iconColorClass[themeColor] || iconColorClass.blue;

  if (style === 'circle') {
    return (
      <div className={`relative z-10 inline-flex items-center justify-center shrink-0 ${iconSizeClasses} rounded-full ${colorData.circle} ${className}`}>
        <IconSVG className="w-2/3 h-2/3" />
      </div>
    );
  }

  const iconColorClasses =
    iconColorClass[parentColor === 'primary' && (iconColor === themeColor || iconColor === 'primary') ? 'white' : iconColor]?.regular || colorData.regular;

  return <IconSVG className={`${iconSizeClasses} ${iconColorClasses} ${className}`} />;
};
