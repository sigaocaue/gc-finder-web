import { defineConfig } from "eslint/config";

export default defineConfig({
  root: true,
  ignorePatterns: [
    "node_modules/**",
    "build/**",
    "out/**",
    ".next/**",
    "next-env.d.ts",
  ],
  extends: [
    "next/core-web-vitals",
    "next/typescript",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
});
