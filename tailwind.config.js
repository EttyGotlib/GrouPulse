/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./(auth)/**/*.{js,ts,jsx,tsx,mdx}", // הוספת השורה הזו לביטחון
  ],
    theme: {
      extend: {
        colors: {
          "primary": "#003643",
          "surface": "#f7f9fe",
          "surface-container-low": "#f1f4f8",
          "surface-container-high": "#e5e8ed",
          "on-surface-variant": "#41484b",
          "secondary": "#32666d",
        },
        fontFamily: {
          headline: ["Manrope", "sans-serif"],
          body: ["Inter", "sans-serif"],
        },
      },
    },
    plugins: [],
  }