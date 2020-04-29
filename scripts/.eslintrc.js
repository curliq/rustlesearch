module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  rules: {
    "no-console": 0,
    "no-restricted-syntax": 0,
    "no-await-in-loop": 0,
  },
};
