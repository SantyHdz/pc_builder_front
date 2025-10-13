/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pc-dark': '#0f1115',
        'pc-panel': '#1a1d24',
        'pc-accent': '#00bcd4',
        'pc-accent-hover': '#26c6da',
        'pc-error': '#ef4444',
      },
    },
  },
  plugins: [],
}
