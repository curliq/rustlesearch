module.exports = {
  parser: 'babel-eslint',
  env: {
    es6: true,
    'jest/globals': true,
    node: true,
  },
  extends: ['plugin:jest/recommended', 'airbnb-base'],
  plugins: ['jest'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  rules: {
    'import/no-unresolved': 'off',
    'func-names': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'generator-star-spacing': ['error', 'after'],
    semi: ['error', 'never'],
    'no-unused-expressions': ['error', { allowTernary: true }],
    'arrow-parens': ['error', 'as-needed'],
  },
}
