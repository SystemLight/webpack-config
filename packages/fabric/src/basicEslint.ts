import type {Linter} from 'eslint'

import {includeLib, isTsProject} from './utils'

/**
 * https://eslint.org/docs/user-guide/configuring/
 */

export function getEslintConfig(
  _isTsProject = isTsProject,
  _isVueProject = includeLib('vue'),
  _isReactProject = includeLib('react')
) {
  // 基础规则配置
  let eslintConfig: Linter.Config = {
    root: true,
    extends: ['eslint:recommended'],
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2022
    },
    env: {
      browser: true,
      es2022: true,
      node: true
    },
    settings: {},
    rules: {
      'no-undef': 'off',
      'no-control-regex': 'off',
      'no-invalid-this': 'off',
      'no-unused-vars': 'off',
      'linebreak-style': 'off',
      'max-len': 'off',
      'require-jsdoc': 'off',
      'prefer-const': 'off',

      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'arrow-parens': ['error', 'always'],
      'comma-dangle': [
        'error',
        {
          arrays: 'never',
          objects: 'never',
          imports: 'never',
          exports: 'never',
          functions: 'never'
        }
      ],
      indent: [
        'error',
        2,
        {
          SwitchCase: 1
        }
      ],
      'padded-blocks': ['error', 'never'],
      'space-before-function-paren': [
        'error',
        {
          asyncArrow: 'always',
          anonymous: 'always',
          named: 'never'
        }
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1
        }
      ]
    }
  }

  if (_isTsProject) {
    (eslintConfig.extends as string[]).push(
      'plugin:@typescript-eslint/recommended' // @typescript-eslint/eslint-plugin
    )

    // ts解析器：https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser
    eslintConfig.parser = '@typescript-eslint/parser'

    // Typescript规则
    const typescriptRule = {
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }

    // 混入Typescript规则配置
    Object.assign(eslintConfig.rules!, typescriptRule)
  } else {
    // js解析器：https://www.npmjs.com/package/@babel/eslint-parser
    eslintConfig.parser = '@babel/eslint-parser'

    let presets = ['@babel/env'] // @babel/preset-env
    let plugins = [
      // 装饰器属性，https://babel.dev/docs/en/babel-plugin-proposal-decorators
      [
        '@babel/proposal-decorators', // @babel/plugin-proposal-decorators
        {
          legacy: true
        }
      ]
    ]

    if (_isReactProject) {
      // js开发解析react jsx
      presets.push('@babel/react') // @babel/preset-react
    }

    eslintConfig.parserOptions = {
      requireConfigFile: false, // 设置为 false 以允许 @babel/eslint-parser 在没有与之关联的 Babel 配置的文件上运行
      babelOptions: {
        presets: presets,
        plugins: plugins
      }
    }
  }

  if (_isReactProject) {
    (eslintConfig.extends as string[]).push(
      'plugin:react/recommended', // eslint-plugin-react
      'plugin:react-hooks/recommended' // eslint-plugin-react-hooks
    )

    eslintConfig.settings!.react = {
      version: 'detect'
    }

    // React规则
    const reactRule = {}

    // 混入React规则配置
    Object.assign(eslintConfig.rules!, reactRule)
  }

  if (_isVueProject) {
    (eslintConfig.extends as string[]).push(
      'plugin:vue/vue3-recommended' // eslint-plugin-vue
    )

    // 使用vue时将解析权交给vue-eslint-parser
    eslintConfig.parserOptions!['parser'] = eslintConfig.parser
    eslintConfig.parser = 'vue-eslint-parser'

    // Vue规则
    const vueRule = {
      'vue/multi-word-component-names': 'off'
    }

    // 混入Vue规则配置
    Object.assign(eslintConfig.rules!, vueRule)
  }

  return eslintConfig
}
