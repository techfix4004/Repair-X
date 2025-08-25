module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  globals: {
    // Jest globals for test files
    describe: 'readonly',
    test: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
  },
  rules: {
    // Relaxed rules for current project state - focus on functionality over strict linting
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_', 
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // Allow any for rapid development
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    'prefer-template': 'off',
    'no-prototype-builtins': 'warn',
    'max-lines-per-function': 'off', // Disable for now - many business logic functions are long
    'complexity': 'off', // Disable for now
    'no-unused-vars': 'off', // handled by @typescript-eslint/no-unused-vars
    'no-undef': 'off', // TypeScript handles this
    'no-duplicate-imports': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
      rules: {
        // Very lenient rules for test files
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
        'max-lines-per-function': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
      }
    }
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};