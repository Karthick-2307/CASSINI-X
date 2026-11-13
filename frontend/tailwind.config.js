/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: "#0b0d17",
          800: "#151928",
          700: "#1e2438",
        }
      }
    },
  },
  plugins: [],
}
