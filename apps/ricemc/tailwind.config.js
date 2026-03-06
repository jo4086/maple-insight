/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
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
