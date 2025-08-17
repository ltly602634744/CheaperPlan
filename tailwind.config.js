/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    './App.{js,jsx,ts,tsx}', 
    './app/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#03A472',
        'brand-soft': '#2AB68D',
        'neutral-darkest': '#212121',
        'neutral-dark': '#616161',
        'neutral-medium': '#9E9E9E',
        'neutral-light': '#E0E0E0',
        'neutral-lightest': '#FAFAFA',
        'func-success': '#4CAF50',
        'func-warning': '#FFC107',
        'func-error': '#F44336',
        'func-info': '#2196F3',
        'accent-blue': '#2979FF',
        'accent-orange': '#FF9800',
      },
    },
  },
  plugins: [],
}