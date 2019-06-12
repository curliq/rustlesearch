module.exports = {
  parser: 'babel-eslint',
  env: {
    'es6': true,
    'jest/globals': true,
    'node': true,
  },
  extends: ['standard', 'plugin:jest/recommended'],
  plugins: ['jest'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  rules: {
    'space-before-function-paren': ['error', 'never'],
    'object-curly-spacing': ['error', 'never'],
    'operator-linebreak': ['error', 'before'],
    'comma-dangle': ['error', 'always-multiline'],
    'curly': ['error', 'multi-or-nest'],
    'max-len': ['error', 80],
  },
}
