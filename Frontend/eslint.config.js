import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // СТИЛЬ ИМЕНОВАНИЯ КОМПОНЕНТОВ И ПЕРЕМЕННЫХ
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: [],
        },
      ],

      'vue/component-definition-name-casing': ['error', 'PascalCase'],

      'vue/match-component-file-name': [
        'error',
        {
          extensions: ['vue'],
          shouldMatchCase: true,
        },
      ],

      // ИМЕНОВАНИЕ ПЕРЕМЕННЫХ
      camelcase: [
        'error',
        {
          properties: 'always',
          ignoreDestructuring: false,
          ignoreImports: false,
          ignoreGlobals: false,
          allow: [
          '^[a-z]+(_[a-z]+)+$', // Разрешаем snake_case
          'created_at',
          'updated_at',
          'email_verified_at',
          'middle_name',
          'first_name',
          'last_name',
          'laravel_through_key'
        ]
        },
      ],

      'vue/custom-event-name-casing': ['error', 'camelCase'],
    },
  },

  skipFormatting,
])