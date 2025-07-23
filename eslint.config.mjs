import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Config dari Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom rules override
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 🔥 matikan error "any"
      "@typescript-eslint/no-unused-vars": "warn", // ubah error ke warning
      "prefer-const": "warn", // kasih warning aja kalau harusnya pakai const
      "react/no-unescaped-entities": "off", // bebas pakai tanda kutip tanpa escape
      "@next/next/no-img-element": "warn", // boleh pakai <img>, kasih warning aja
    },
  },
];

export default eslintConfig;
