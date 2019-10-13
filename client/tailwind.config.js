const { colors } = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "Helvetica", "Arial", "sans-serif"]
      },
      colors: {
        accent: "#de973a",
        gray: {
          "100": "#f5f5f5",
          "200": "#eeeeee",
          "300": "#e0e0e0",
          "400": "#bdbdbd",
          "500": "#9e9e9e",
          "600": "#757575",
          "700": "#616161",
          "800": "#424242",
          "850": "#2c2c2c",
          "900": "#212121",
          "950": "#151515"
        },
        "bg-semi": {
          "75": "rgba(0, 0, 0, 0.75)",
          "50": "rgba(0, 0, 0, 0.50)",
          "25": "rgba(0, 0, 0, 0.25)"
        }
      }
    }
  },
  variants: {},
  plugins: []
};
