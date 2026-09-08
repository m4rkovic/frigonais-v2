/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './products.html', './assets/*.js'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#F0F7F1', 100: '#D9ECD9', 200: '#B4D9B4', 400: '#5FAD5F', 500: '#3D8B3D', 600: '#2D6E2D', 700: '#1F5C1F', 800: '#174A17', 900: '#0F3A0F', 950: '#082508' },
        accent: { 50: '#FFF5F5', 100: '#FFE3E3', 200: '#FFC4C4', 400: '#E8505B', 500: '#D63A45', 600: '#B82D37', 700: '#9A1F28', 800: '#7D1A22' },
        neutral: { 50: '#FAFAF9', 100: '#F5F4F2', 150: '#EDECE9', 200: '#E2E0DC', 300: '#C9C6BF', 400: '#A8A39A', 500: '#8A8479', 600: '#6B665C', 700: '#4D4943', 800: '#33312C', 900: '#1A1917' }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
};
