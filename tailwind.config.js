/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Pixelify Sans", "sans-serif"],
      },
      colors: {
        bgblack: "#161617",
        bgwhite: "#FAFAFC",
      },
    },
  },
  plugins: [],
};
