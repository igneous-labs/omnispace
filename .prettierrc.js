/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require("prettier-plugin-tailwindcss")],
  trailingComma: "all",
  semi: true,
  tabWidth: 2,
  arrowParens: "always",
  quoteProps: "consistent",
};
