/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- enable dark mode
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF', // lavender-blue
        accent: '#A78BFA', // soft violet
      },
    },
  },
  plugins: [],
}
