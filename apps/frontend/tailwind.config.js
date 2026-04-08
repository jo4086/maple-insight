/** @type {import('tailwindcss').Config} */
import tailwindScollabr from 'tailwind-scrollbar';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@maple/ui/dist/index.{js,cjs}', '../../packages/mapleInsight-ui/src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mixed: ['"JetBrains Mono"', '"Noto Sans KR"', 'sans-serif'],
      },
    },
  },
  plugins: [
    tailwindScollabr,
    plugin(function ({ addComponents }) {
      addComponents({
        '.my-container': {
          width: '100%',
          border: '1px solid',
          borderRadius: '0.375rem', // md
        },
      });
    }),
  ],
};
