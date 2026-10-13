/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec2ff',
          400: '#599fff',
          500: '#337bfd',
          600: '#1d5bf2',
          700: '#1546df',
          800: '#183ab4',
          900: '#1a368e',
        },
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
