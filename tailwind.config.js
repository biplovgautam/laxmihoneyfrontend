/** @type {import('tailwindcss').Config} */



export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {// Add your custom color here
        customorangelight: '#f79051', 
        customorangedark: '#f37623',
        customorangelight2: '#f69868', 
        productcard:"#ffb78b",
        textdark:"#f2f2f3",
        customorangedarkopp: '#6085a0',

        
        primary: "#f97316",
      },

      fontFamily: {
        playfair : ['"Playfair Display"', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        // roboto-slab : ['"Roboto Slab"', 'serif'],
        raleway : ["Raleway", 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
        sans: ["Poppins", "sans-serif"],
        handwriting: ["Merienda", "cursive"],
      },
      dropShadow: {
        'custom-md': '2px 4px 2px rgba(0, 0, 0, 0.20)',
        'custom-lg': '1px 1px 4px rgba(0, 0, 0, 0.50)',
        'custom-xl': '1px 2px 6px rgba(0, 0, 0, 0.50)',
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
      animation: {
        buzzingBee: 'buzzing 3s ease-in-out infinite',
      },
      keyframes: {
        buzzing: {
          '0%': { transform: 'translateX(-50px) translateY(0px)' },
          '50%': { transform: 'translateX(50px) translateY(-30px)' },
          '100%': { transform: 'translateX(-50px) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
