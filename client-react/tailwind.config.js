module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        planeOrange: "url('/images/plane-orange.webp')"
      },
      colors: {
        dark:"#1A1A1A",
        "dark-el-1":"#282828" // el stands for elevation
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
