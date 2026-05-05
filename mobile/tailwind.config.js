/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0c",
        charcoal: "#171719",
        graphite: "#2a2a2d",
        mist: "#f4f4f1",
        stone: "#e7e4dc",
        brass: "#b59b68",
        oxblood: "#6f2438"
      }
    }
  },
  plugins: []
};
