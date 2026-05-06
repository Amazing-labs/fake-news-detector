import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  {
    ignores: ['**/*.test.ts', '**/*.spec.ts', '.github/**/*.js'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-extraneous-class': 'off',
      'no-var': 'error',
    },
  },
)
