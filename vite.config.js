/* eslint-disable import/no-extraneous-dependencies */
// silence `'vite' should be listed in project's dependencies, not devDependencies`

import { defineConfig } from "vite";

// import path from "path" causes eslint to crash for some reason
const path = require("path");

export default defineConfig({
  appType: "mpa",
  build: {
    // include source maps if env var set to true
    sourcemap: process.env.SOURCE_MAP === "true",
    rollupOptions: {
      input: {
        404: path.resolve(__dirname, "404.html"),
        login: path.resolve(__dirname, "login.html"),
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
  resolve: {
    alias: [
      // to allow `import a from "@/js/a"` to work in prod
      { find: "@", replacement: __dirname },
    ],
  },
  server: {
    port: 8003,
  },
  define: {
    // workaround for matrix-js-sdk: `global` is not defined
    global: "window",
  },
});
