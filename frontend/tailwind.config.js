/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16213e',
          dark: '#1a1a2e',
        },
        accent: {
          DEFAULT: '#e8722a',
          hover: '#d4631f',
          light: '#fff5f0',
        },
        cream: '#faf5f0',
        body: '#4a4a68',
      },
    },
  },
  plugins: [],
};
