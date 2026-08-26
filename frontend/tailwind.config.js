/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc3fc',
          400: '#38a5f8',
          500: '#0e87e3',
          600: '#0267c1',
          700: '#03529d',
          800: '#084781',
          900: '#0d3c6c',
          950: '#0a264c',
        },
        healora: {
          light: '#f0f7ff',
          dark: '#0d335d',
          accent: '#2b7a8d',
        }
      }
    },
  },
  plugins: [],
}
