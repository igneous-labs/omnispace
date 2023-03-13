/* eslint-disable import/no-extraneous-dependencies */
// silence `'tailwindcss'/'@tailwindcss/forms' should be listed in project's dependencies, not devDependencies`

const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("tailwindcss").Config} */
module.exports = {
  // dont use overly-broad patterns like ./**/*.{js,css,html}
  // since this has no exclude option
  content: [
    "./404.html",
    "./index.html",
    "./login.html",
    "./css/**/*.css",
    "./js/**/*.js",
  ],
  // eslint-disable-next-line global-require
  plugins: [require("@tailwindcss/forms")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
