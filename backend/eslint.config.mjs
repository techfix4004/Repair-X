import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      
      // General JavaScript rules (relaxed for legacy code)
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'prefer-const': 'warn', // Changed from error to warn
      'no-var': 'error',
      'object-shorthand': 'warn', // Changed from error to warn
      'prefer-template': 'warn', // Changed from error to warn
      'no-duplicate-imports': 'warn', // Changed from error to warn
      'no-prototype-builtins': 'warn', // Add this rule as warning
      
      // Code quality rules for Six Sigma compliance (relaxed for legacy code)
      'complexity': ['warn', { max: 15 }], // Temporarily increased
      'max-lines-per-function': ['warn', { max: 80, skipComments: true }], // Temporarily increased
      'max-depth': ['warn', 6], // Temporarily increased
      'max-params': ['warn', 8], // Temporarily increased
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];