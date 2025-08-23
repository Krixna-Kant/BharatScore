/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#A3E635", // green like your mockup
        secondary: "#F9FAFB", // light background
        dark: "#111827", // text color
      },
    },
  },
  plugins: [],
};
