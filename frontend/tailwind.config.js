/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Avenir Next"', '"Segoe UI"', 'sans-serif'],
        display: ['"Space Grotesk"', '"IBM Plex Sans"', '"Avenir Next"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 22px 55px -28px rgba(15, 23, 42, 0.28)',
      },
    },
  },
  plugins: [],
}
