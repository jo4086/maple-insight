/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';
import tailwindScollabr from 'tailwind-scrollbar';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@maple/ui/dist/index.{js,cjs}',
    '../../packages/mapleInsight-ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
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
