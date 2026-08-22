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
      // The content page's format ticker: the track holds two identical copies
      // of the list and travels exactly half its width, so the loop point lands
      // on a seam already showing the same text.
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
      },
      colors: {
        black: "#161617",
        white: "#FAFAFC",
        red: "#de0405",
      },
    },
  },
  plugins: [],
};
