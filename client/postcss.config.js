/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const purgecss = require("@fullhuman/postcss-purgecss")({
  content: [
    "./src/**/*.html",
    "./public/**/*.html",
    "./src/**/*.vue",
    "./src/**/*.css",
    "./src/**/*.scss",
    "./src/**/*.js"
  ],
  whitelistPatterns: [/^vs/],
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
});

module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss"),
    require("autoprefixer"),
    ...(process.env.NODE_ENV === "production" ? [purgecss] : [])
  ]
};
