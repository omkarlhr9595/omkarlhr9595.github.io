/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
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
