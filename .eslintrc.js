module.exports = {
  env: {
    es6: true,
  },
  extends: ['standard'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  rules: {
    'space-before-function-paren': ['error', 'never'],
    'object-curly-spacing': ['error', 'never'],
    'operator-linebreak': ['error', 'before'],
    'comma-dangle': ['error', 'always-multiline'],
    // 'curly': ['error', 'multi-or-nest'],
  },
}
