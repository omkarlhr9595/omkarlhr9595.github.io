/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./setup/**/*.html",
    "./content/**/*.html",
    "./gaming/**/*.html",
    "./projects/**/*.html",
    "./src/**/*.ts",
  ],
  theme: {
    extend: {
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
        heading: [
          "Montserrat",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
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
        red: "#a51114",
      },
      keyframes: {
        // Jitters the oversized noise tile between a handful of offsets; the
        // stepped timing is what makes it read as film grain rather than a pan.
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translate(-5%, -10%)" },
          "20%, 40%, 60%, 80%": { transform: "translate(-15%, -20%)" },
        },
      },
      animation: {
        grain: "grain 8s steps(10) infinite",
      },
    },
  },
  plugins: [],
};
