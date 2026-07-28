/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta sóbria e deliberadamente apartidária:
        // verde-musgo escuro (institucional), grafite e dourado envelhecido.
        moss: {
          50: '#f2f6f2',
          100: '#dfe8df',
          200: '#bccbbd',
          300: '#93a894',
          400: '#6c8270',
          500: '#4f6553',
          600: '#3c4f40',
          700: '#2f3e33',
          800: '#243026',
          900: '#1a231c',
          950: '#101610',
        },
        graphite: {
          100: '#e6e7e6',
          200: '#c3c5c3',
          300: '#9a9d9a',
          400: '#71746f',
          500: '#53564f',
          600: '#3e413c',
          700: '#2e312d',
          800: '#212320',
          900: '#171816',
          950: '#0e0f0e',
        },
        brass: {
          200: '#e8d9ac',
          300: '#d9c485',
          400: '#c9ac5c',
          500: '#b3933f',
          600: '#8f7430',
          700: '#6b5726',
        },
        alarm: '#a8543f',
        calm: '#5c8a72',
      },
      fontFamily: {
        display: ['"Georgia"', 'serif'],
      },
    },
  },
  plugins: [],
};
