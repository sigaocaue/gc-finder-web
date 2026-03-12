import { defineConfig } from "eslint/config";
import next from "@next/eslint-plugin-next";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "out/**",
      ".next/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      next,
      react,
      "react-hooks": reactHooks,
      prettier,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...next.configs["core-web-vitals"].rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      curly: ["error", "all"],
    },
  },
]);
