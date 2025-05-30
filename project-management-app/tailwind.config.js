/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003049',
          50: '#e6f0f5',
          100: '#cce0eb',
          200: '#99c2d7',
          300: '#66a3c2',
          400: '#3385ae',
          500: '#00669a',
          600: '#00527b',
          700: '#003d5c',
          800: '#00293e',
          900: '#00141f',
        },
        secondary: {
          DEFAULT: '#f77f00',
          50: '#fff9e6',
          100: '#fff3cc',
          200: '#ffe799',
          300: '#ffdb66',
          400: '#ffcf33',
          500: '#ffc300',
          600: '#cc9c00',
          700: '#997500',
          800: '#664e00',
          900: '#332700',
        },
        accent: {
          DEFAULT: '#d62828',
          light: '#e85d5d',
          dark: '#a81f1f',
        },
      },
    },
  },
  plugins: [],
};
