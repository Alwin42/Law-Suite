/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: "#F9FAFB", // Off-white/Light Grey
        primary: "#1A1A1A",    // Charcoal/Near-black
        accent: "#64748B",     // Muted Slate
      },
    },
  },
  plugins: [],
}