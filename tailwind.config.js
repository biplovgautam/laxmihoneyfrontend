/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f97316",
      },

      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        handwriting: ["Merienda", "cursive"],
      },
      dropShadow: {
        'custom-md': '2px 4px 2px rgba(0, 0, 0, 0.20)',
<<<<<<< HEAD
        'custom-lg': '2px 4px 3px rgba(0, 0, 0, 0.30)',
        'custom-xl': '4px 6px 5px rgba(0, 0, 0, 0.30)',
=======
        'custom-lg': '1px 1px 4px rgba(0, 0, 0, 0.50)',
        'custom-xl': '1px 2px 6px rgba(0, 0, 0, 0.50)',
>>>>>>> origin/main
        'custom-white': '2px 4px 6px rgba(255, 255, 255, 0.75)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
    },
  },
  plugins: [],
};
