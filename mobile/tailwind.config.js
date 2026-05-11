/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0c",
        charcoal: "#1a1a19",
        graphite: "#31302c",
        mist: "#f5f2ed",
        stone: "#aaa59c",
        brass: "#e4bf72",
        oxblood: "#8f3345"
      }
    }
  },
  plugins: []
};
