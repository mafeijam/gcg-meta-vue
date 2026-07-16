import autoImportGlobals from './.dev/.eslintrc-auto-import.json' with { type: 'json' }
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...autoImportGlobals.globals,
      },
    },
  },
  eslintConfigPrettier,
  {
    rules: {
      'no-unexpected-multiline': 'error',
      curly: ['error', 'all'],
      semi: ['error', 'never', { beforeStatementContinuationChars: 'never' }],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: false },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'always', component: 'always' },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },
  {
    files: ['**/*.vue', 'src/composables/**', 'src/utils/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'vue', message: 'Auto-imported. Remove this import.' },
            { name: 'vue-router', message: 'Auto-imported. Remove this import.' },
          ],
          patterns: [
            { group: ['../composables/*', '../../composables/*', '../../../composables/*'], message: 'Auto-imported. Remove this import.' },
            { group: ['../utils/*', '../../utils/*', '../../../utils/*'], message: 'Auto-imported. Remove this import.' },
            { group: ['@/composables/*'], message: 'Auto-imported. Remove this import.' },
            { group: ['@/utils/*'], message: 'Auto-imported. Remove this import.' },
          ],
        },
      ],
    },
  },
]
