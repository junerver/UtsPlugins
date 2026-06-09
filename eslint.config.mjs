import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  // 忽略目录
  {
    ignores: [
      'unpackage/**',
      'node_modules/**',
      'dist/**',
      'harmony-configs/**',
      'uni_modules/**/utssdk/**', // UTS/ArkTS 文件不由 ESLint 处理
      '*.har',
    ],
  },

  // JS 基础规则
  js.configs.recommended,

  // Vue 3 规则
  ...pluginVue.configs['flat/recommended'],

  // Prettier 集成（关闭与 Prettier 冲突的规则）
  prettier,

  // 全局配置
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // uni-app 全局变量
        uni: 'readonly',
        plus: 'readonly',
        wx: 'readonly',
        getCurrentPages: 'readonly',
        getApp: 'readonly',
        UniError: 'readonly',
        IUniError: 'readonly',
        UTSAndroid: 'readonly',
        UTSHarmony: 'readonly',
      },
    },
    rules: {
      // ===== Prettier =====
      'prettier/prettier': [
        'warn',
        {
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
          printWidth: 100,
          endOfLine: 'auto',
          // Vue 文件中 script 缩进跟随 template
          vueIndentScriptAndStyle: true,
        },
      ],

      // ===== Vue =====
      'vue/multi-word-component-names': 'off', // 页面组件名不需要多词
      'vue/no-v-model-argument': 'off', // Vue 3 支持
      'vue/require-default-prop': 'off', // 可选 prop 不需要默认值
      'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
      'vue/html-indent': ['warn', 2],
      'vue/html-self-closing': [
        'warn',
        {
          html: { void: 'always', normal: 'never', component: 'always' },
        },
      ],

      // ===== JS =====
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }], // 允许 console.log 用于调试
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
]
