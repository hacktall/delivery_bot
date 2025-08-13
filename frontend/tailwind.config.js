/** @type {import('tailwindcss').Config} */
// tailwind.config.js
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        colors: 'background-color, border-color, color, fill, stroke',
      },
      colors: {
        gray: {
          850: '#1f2937', // cor personalizada usada no modo escuro
        },
      },
    },
  },
  plugins: [],
};
