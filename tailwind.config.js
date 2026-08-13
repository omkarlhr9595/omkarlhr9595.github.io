/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./projects/**/*.html", "./src/**/*.ts"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        body: ["Pixelify Sans", "sans-serif"],
        greeting: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Noto Sans",
          "Noto Sans JP",
          "Noto Sans Devanagari",
          "Noto Sans Tamil",
          "Noto Sans Telugu",
          "Noto Sans Malayalam",
          "Noto Sans Bengali",
          "Noto Sans Kannada",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        black: "#161617",
        white: "#FAFAFC",
      },
    },
  },
  plugins: [],
};
