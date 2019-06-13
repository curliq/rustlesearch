module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['plugin:vue/recommended', '@vue/standard'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': ['error', 'never'],
    'object-curly-spacing': ['error', 'never'],
    'operator-linebreak': ['error', 'before'],
    'comma-dangle': ['error', 'always-multiline'],
    'curly': ['error', 'multi-or-nest'],
    'max-len': ['error', 80],
    'generator-star-spacing': ['error', 'after'],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
