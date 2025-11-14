module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    'indent': ['error', 2],
    'linebreak-style': 'off',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always']
  }
};
