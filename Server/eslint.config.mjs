import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2021, // Specify ECMAScript version
      sourceType: "module", // Use "commonjs" if your project uses CommonJS
      globals: {
        ...globals.node, // Include Node.js globals
        process: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn", // Warn about unused variables
      "no-undef": "error", // Error on undefined variables
    },
  },
];