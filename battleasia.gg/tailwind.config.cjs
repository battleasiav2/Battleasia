/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  corePlugins: {
    // Disable Tailwind preflight so it does not collide with MUI CssBaseline
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        'brand-lime': '#cbfb24',
        'brand-lime-light': '#e2ff58',
        'brand-lime-dark': '#9de006',
        'brand-gold': '#f5c518',
        'brand-dark': '#07090d',
      },
      fontFamily: {
        gaming: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
