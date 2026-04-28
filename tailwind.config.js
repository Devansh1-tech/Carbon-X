/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: "#1a1a2e",
        forest: "#16213e",
        leaf: "#0f3460",
        credit: "#00b4d8",
        success: "#06d6a0",
      },
    },
  },
  plugins: [],
}
