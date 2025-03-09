/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      fontFamily: {
        body: ["Pixelify Sans", "sans-serif"],
      },
      colors: {
        black: "#161617",
        white: "#FAFAFC",
      },
    },
  },
  plugins: [],
};
