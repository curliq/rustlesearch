module.exports = {
  env: {
    'es6': true,
    'jest/globals': true,
    'node': true,
  },
  extends: [
    'plugin:jest/recommended',
    'emerald',
    'plugin:prettier/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'script',
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  plugins: ['jest', 'prettier'],
  rules: {
    // doesnt work well with dynamic require()
    'import/newline-after-import': 'off',
    // this only works with import
    'import/order': 'off',
    'prettier/prettier': 'error',
  },
}
