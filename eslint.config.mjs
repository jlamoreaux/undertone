import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "supabase/**"]),
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      quotes: ["error", "double"],
      "space-in-parens": "error",
      "no-trailing-spaces": "error",
      "no-console": "warn",
      "object-curly-spacing": ["error", "always"],
      "@typescript-eslint/no-unused-vars": "error",
      // New in eslint-plugin-react-hooks v7 (Next 16). Existing code mutates SWR data and
      // useState values in place; fixing that changes runtime behavior, so it is tracked
      // as a warning until the hooks are refactored.
      "react-hooks/immutability": "warn",
    },
  },
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: { sourceType: "commonjs" },
  },
]);
