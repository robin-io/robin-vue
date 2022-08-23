module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:vue/strongly-recommended'],
  parserOptions: {
    ecmaVersion: 12,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'no-undef': 'off',
    camelcase: 'off',
    'vue/no-reserved-component-names': 'off',
    'vue/multi-word-component-names': 'off'
  }
};
