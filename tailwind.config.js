/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'fintech-green': '#34D399',
        'fintech-light': '#ECFDF5'
      }
    }
  },
  plugins: []
}
