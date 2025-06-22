/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7f2',
          100: '#e8ede1',
          200: '#d1dcc3',
          300: '#b9c9a5',
          400: '#a2b587',
          500: '#6B8E23', // Herbal Green
          600: '#5c7a1e',
          700: '#4d6619',
          800: '#3e5214',
          900: '#2f3e0f',
        },
        sage: '#C1D9B0',  // Soft Sage
        cream: '#FAF9F6',  // Cream White
        terra: {
          50: '#fdf5f3',
          100: '#fae7e2',
          200: '#f5cec4',
          300: '#eeab99',
          400: '#e38872',
          500: '#D96C4F', // Terracotta
          600: '#c45539',
          700: '#a3442f',
          800: '#853a2b',
          900: '#6d3328',
        },
        charcoal: '#333333', // Charcoal Gray
        lemon: {
          DEFAULT: '#F6C244', // Lemon Zest
        },
          },
      },
      lemon: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F6C244', // Original lemon color
        600: '#D9A000',
        700: '#B38000',
        800: '#8C6000',
        900: '#664000',
      },
  }
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};