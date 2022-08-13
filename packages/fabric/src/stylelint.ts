import type {Config} from 'stylelint'

import {includeLib} from './utils'

/**
 * https://stylelint.io/user-guide/rules/list
 * - null（关闭规则）
 * - 单个值（primary option）
 * - 具有两个值的数组 ( [primary option, secondary options])
 */
let stylelintConfig: Config = {
  ignoreFiles: ['*.js', '*.jsx', '*.ts', '*.tsx'],
  extends: ['stylelint-config-css-modules', 'stylelint-config-idiomatic-order'],
  plugins: ['stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,

    'no-descending-specificity': null,
    'no-empty-source': null,
    'selector-class-pattern': null,
    'selector-type-no-unknown': null,
    'selector-list-comma-newline-after': null,
    'font-family-no-missing-generic-family-keyword': null,

    indentation: 2,
    'color-hex-case': 'upper',
    'color-hex-length': 'long',
    'color-function-notation': 'modern',
    'function-url-quotes': 'always',
    'selector-attribute-quotes': 'always',
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx']
      }
    ],
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['composes'],
        ignoreFunctions: ['v-bind']
      }
    ],
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['func.rpx', 'v-bind']
      }
    ]
  }
}

if (includeLib('sass')) {
  (stylelintConfig.extends as string[]).push('stylelint-config-standard-scss', 'stylelint-config-prettier-scss')
  ;(stylelintConfig.rules as any)['scss/function-no-unknown'] = [
    true,
    {
      ignoreFunctions: ['func.rpx', 'v-bind']
    }
  ]
  ;(stylelintConfig.rules as any)['scss/at-rule-no-unknown'] = [
    true,
    {
      ignoreAtRules: ['tailwind', 'apply']
    }
  ]
}

if (includeLib('vue')) {
  // 依赖postcss-html
  (stylelintConfig.extends as string[]).push('stylelint-config-html/vue')

  if (includeLib('sass')) {
    (stylelintConfig.extends as string[]).push('stylelint-config-recommended-vue/scss')
  }
}

export default stylelintConfig
