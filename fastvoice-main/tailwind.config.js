/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      // Override the default font family
      sans: ['Gabarito', 'sans-serif'],
      // Keep gabarito class for explicit usage
      gabarito: ['Gabarito', 'sans-serif'],
    },
    extend: {
      // other extensions...
    },
  },
  plugins: [],
} 