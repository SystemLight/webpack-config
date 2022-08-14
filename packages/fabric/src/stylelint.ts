import type {Config} from 'stylelint'

import {includeLib} from './utils'

let stylelintConfig: Config = {
  ignoreFiles: ['*.js', '*.jsx', '*.ts', '*.tsx'],
  extends: ['stylelint-config-css-modules', 'stylelint-config-idiomatic-order'],
  plugins: ['stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,

    'selector-class-pattern': null,
    'selector-type-no-unknown': null,
    'no-empty-source': null,
    'selector-list-comma-newline-after': null,
    'font-family-no-missing-generic-family-keyword': null,
    'no-descending-specificity': null,

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
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['func.rpx', 'v-bind']
      }
    ],
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['composes'],
        ignoreFunctions: ['v-bind']
      }
    ]
  }
}

if (includeLib('sass')) {
  (stylelintConfig.extends as string[]).push('stylelint-config-standard-scss', 'stylelint-config-prettier-scss')
  ;(stylelintConfig.rules as string[])['scss/at-rule-no-unknown'] = [
    true,
    {
      ignoreAtRules: ['tailwind', 'apply']
    }
  ]
  ;(stylelintConfig.rules as string[])['scss/function-no-unknown'] = [
    true,
    {
      ignoreFunctions: ['func.rpx', 'v-bind']
    }
  ]
}

/**
 * vue项目依赖
 * postcss-html
 * stylelint-config-html
 * stylelint-config-recommended-vue
 *
 * extends
 * - stylelint-config-html/vue
 * - stylelint-config-recommended-vue/scss
 */

export default stylelintConfig
