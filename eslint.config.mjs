import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const serverDir = join(rootDir, 'app/server')
const webDir = join(rootDir, 'app/web')

export default defineConfig(
  {
    ignores: ['**/*.test.ts', '**/*.spec.ts', '.github/**/*.js', '**/dist/**'],
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
    files: ['app/server/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: serverDir,
      },
    },
  },
  {
    files: ['app/web/**/*.{ts,tsx}', 'app/web/vite.config.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: webDir,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-extraneous-class': 'off',
      'no-var': 'error',
    },
  },
)
