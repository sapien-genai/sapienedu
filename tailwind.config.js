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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#000000',
          600: '#0c0c0c',
          700: '#1a1a1a',
          800: '#262626',
          900: '#333333',
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