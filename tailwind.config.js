/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        bubble: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      },
      animation: {
        'bubble': 'bubble 3s ease-in-out infinite',
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
