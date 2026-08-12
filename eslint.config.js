import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * HONESTY RULES (anti-fabrication ratchet)
 * ----------------------------------------
 * This app was originally a demo wired to a sample-data module, and fabricated
 * content kept leaking into user-facing pages. The sample module is deleted; these
 * rules exist so it cannot come back and so fabricated values cannot be typed
 * straight into a page template.
 *
 * RULE: a page renders what its own row contains, or renders nothing.
 *
 * Applies to src/pages/** and src/components/** only. Tests, scripts, and
 * constants/taxonomy modules (src/lib/**, src/i18n/**) are exempt on purpose.
 */
const noSampleImports = [
  "error",
  {
    paths: [
      {
        name: "@/lib/sampleData",
        message:
          "The sample-data module was deleted. Query the row's own data instead — a page renders what its row contains, or renders nothing.",
      },
    ],
    patterns: [
      {
        group: [
          "**/sampleData",
          "**/sample-data",
          "**/sampleData/**",
          "**/samples/**",
          "**/mock",
          "**/mocks/**",
          "**/mockData",
          "**/fixture",
          "**/fixtures/**",
          "**/*.fixtures",
        ],
        message:
          "Pages and components must not import sample/mock/fixture data. Real rows only; if there is no row, render an honest empty state.",
      },
    ],
  },
];

const noFabricatedLiterals = [
  "error",
  {
    // Literal star-rating / review-count values passed as props.
    selector:
      "JSXAttribute[name.name=/^(rating|stars|starRating|reviewCount|reviewsCount|reviews)$/] > JSXExpressionContainer > Literal[value=/^[0-9]/]",
    message:
      "Ratings and review counts must come from the row (e.g. row.rating), never a literal in the template. A hardcoded rating is a fabricated review.",
  },
  {
    selector:
      "JSXAttribute[name.name=/^(rating|stars|starRating|reviewCount|reviewsCount|reviews)$/] > Literal[value=/^[0-9]/]",
    message:
      "Ratings and review counts must come from the row (e.g. row.rating), never a literal in the template. A hardcoded rating is a fabricated review.",
  },
  {
    // Literal currency amounts rendered as page text.
    selector: "JSXText[value=/[0-9][0-9,.]*\\s*(EGP|جنيه)|(EGP|جنيه)\\s*[0-9]/]",
    message:
      "Prices must come from the row, not the template. Render row.price (and its currency label from i18n) instead of a literal amount.",
  },
  {
    selector: "Literal[value=/^\\s*(EGP|جنيه)?\\s*[0-9][0-9,.]*\\s*(EGP|جنيه)\\s*$/]",
    message:
      "Prices must come from the row, not the template. Render row.price (and its currency label from i18n) instead of a literal amount.",
  },
  {
    // Literal phone numbers (Egyptian mobile / +country formats).
    selector: "Literal[value=/(\\+20[\\s-]?1[0-9]{2}[\\s-]?[0-9]{3}|00201[0-9]{9}|\\b01[0125][0-9]{8}\\b)/]",
    message:
      "Phone numbers must come from the row / the provider contact RPC, never a literal. A hardcoded number is fabricated contact detail.",
  },
  {
    selector: "TemplateElement[value.raw=/(\\+20[\\s-]?1[0-9]{2}[\\s-]?[0-9]{3}|00201[0-9]{9}|\\b01[0125][0-9]{8}\\b)/]",
    message:
      "Phone numbers must come from the row / the provider contact RPC, never a literal. A hardcoded number is fabricated contact detail.",
  },
  {
    // Trust badges that assert something the data does not.
    selector: "JSXText[value=/\\b(Verified|verified attendee|Verified Attendee|Payment Protected|موثّق|موثق)\\b/]",
    message:
      "Verification / trust badge text must be driven by a real column (e.g. row.verified_at). Static badge text asserts a fact the data does not support.",
  },
];

export default tseslint.config(
  { ignores: ["dist", "dev-dist", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Honesty rules — user-facing surfaces only.
  {
    files: ["src/pages/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": noSampleImports,
      "no-restricted-syntax": noFabricatedLiterals,
    },
  },
  // Tests and test helpers are exempt: fixtures there are never shown to users.
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/__tests__/**",
      "src/test/**",
      "tests/**",
      "playwright-fixture.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
      "no-restricted-syntax": "off",
    },
  },
);
