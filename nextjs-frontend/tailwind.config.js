/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4a90e2',
        'primary-dark': '#2c5282',
        'primary-light': '#f0f8ff',
        secondary: '#ff6b35',
        accent: '#25d366',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4a90e2, #2c5282)',
        'gradient-light': 'linear-gradient(135deg, #f0f8ff, #e6f3ff)',
      },
    },
  },
  plugins: [],
}
