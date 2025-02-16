module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    "@typescript-eslint/no-extra-semi": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "_",
      },
    ],
    semi: "off",

    quotes: ["error", "double", { avoidEscape: true }],
    "prefer-const": "error",
    "space-before-function-paren": [
      "error", {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "node/no-callback-literal": "off",
    curly: ["off", "multi"],
    "array-bracket-newline": ["error", { multiline: true }],
    "brace-style": ["error", "stroustrup", { allowSingleLine: true }],
    "no-multiple-empty-lines": "off",

    "require-await": "error",
    "no-mixed-operators": "off",

    eqeqeq: ["off", "always"],
    "comma-dangle": ["off", "always"],
    "no-unused-expressions": "error",

    "spaced-comment": ["error", "never"],
  },
};
