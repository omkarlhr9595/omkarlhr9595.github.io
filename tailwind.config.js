/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        bubble: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        bubble: "bubble 3s ease-in-out infinite",
        "slide-up": "slideUp 0.7s ease-out forwards",
        "scale-in": "scaleIn 0.7s ease-out forwards",
      },
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
