/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        light: { DEFAULT: "#F8F8F8" },
        dark: { DEFAULT: "#03030D" },
        navy: { DEFAULT: "#0F0E37" },
        cyan: { DEFAULT: "#00D4FF" },
        pink: { DEFAULT: "#FF00E0" },
      },
    },
  },
  plugins: [],
}
