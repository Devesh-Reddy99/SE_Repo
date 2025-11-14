module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'indent': ['error', 2],
    'linebreak-style': 'off',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'testing-library/await-async-utils': 'warn',
    'testing-library/no-node-access': 'warn',
    'testing-library/no-wait-for-multiple-assertions': 'warn',
    'jest/no-conditional-expect': 'warn',
    'import/no-anonymous-default-export': 'warn'
  }
};
