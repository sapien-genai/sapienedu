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
          50: '#f3f0ff',
          100: '#e9e2ff',
          200: '#d6c9ff',
          300: '#b8a3ff',
          400: '#9470ff',
          500: '#6821F4',
          600: '#5a1de6',
          700: '#4c17c2',
          800: '#3f149e',
          900: '#35127f',
        },
        success: {
          50: '#f0f0f0',
          100: '#e0e0e0',
          200: '#c0c0c0',
          300: '#a0a0a0',
          400: '#808080',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'progress': 'progress 1s ease-out',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
        }
      }
    },
  },
  plugins: [],
}