// eslint.config.js
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],
    languageOptions: {
      globals: {
        ...globals.node,
        require: "readonly",
        module: "readonly",
        process: "readonly"
      },
      ecmaVersion: 2022
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "off" // Disable since we're using globals
    }
  }
];