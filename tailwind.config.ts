import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}', './content/**/*.{md,mdx}'],
  theme: {
    extend: {
      keyframes: {
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: '0',
          },
        },
      },
      animation: {
        meteor: 'meteor 5s linear infinite',
      },
      colors: {
        mocha: {
          base: '#1e1e2e',
          mantle: '#181825',
          crust: '#11111b',
          text: '#cdd6f4',
          mauve: '#cba6f7',
          blue: '#89b4fa',
          teal: '#94e2d5',
        },
      },
      fontFamily: { sans: ['var(--font-sans)'], heading: ['var(--font-abel)'], mono: ['var(--font-mono)'] },
      typography: {
        DEFAULT: {
          css: {
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-abel)',
              fontWeight: '400',
            },
            'p, ul, ol': {
              fontFamily: 'var(--font-sans)',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
