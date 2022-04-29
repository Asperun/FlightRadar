module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      fontFamily: {
        roboto: ["Roboto, sans-serif"],
      },
      backgroundImage: {
        planeOrange: "url('/images/plane-orange.webp')",
      },
      colors: {
        "dark": "#1A1A1A",
        "white-100": "#F5F6F7",
        "dark-el-1": "#282828",
      },
    },
  },
};
