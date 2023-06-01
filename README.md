# @systemlight/webpack-config

> Webpack common configuration.

## 相关包

| 包                                                                                      | 作用                      | npm                                                                                                                                                             |
|----------------------------------------------------------------------------------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [@systemlight/auto-route-webpack-plugin](packages/auto-route-webpack-plugin/README.md) | webpack自动路由插件           | [![NPM version](https://img.shields.io/npm/v/@systemlight/auto-route-webpack-plugin.svg)](https://www.npmjs.com/package/@systemlight/auto-route-webpack-plugin) |
| [@systemlight/fabric](packages/fabric/README.md)                                       | lint规范快速生成工具包           | [![NPM version](https://img.shields.io/npm/v/@systemlight/fabric.svg)](https://www.npmjs.com/package/@systemlight/fabric)                                       |
| [@systemlight/webpack-config](packages/webpack-config/README.md)                       | webpack智能配置             | [![NPM version](https://img.shields.io/npm/v/@systemlight/webpack-config.svg)](https://www.npmjs.com/package/@systemlight/webpack-config)                       |
| [@systemlight/webpack-config-mockserver](packages/webpack-config-mockserver/README.md) | webpack mocks server中间件 | [![NPM version](https://img.shields.io/npm/v/@systemlight/webpack-config-mockserver.svg)](https://www.npmjs.com/package/@systemlight/webpack-config-mockserver) |

## 项目技术栈依赖

### NodeJs

- git(.gitignore | .gitattributes)
- husky(.husky/)
- dotenv(.env)
- lint-staged(.lintstagedrc.json)
- editorconfig(.editorconfig)
- prettier(.prettierrc.js | .prettierignore)
- eslint(.eslintrc.js | .eslintignore)
  - @typescript-eslint/parser
  - @typescript-eslint/eslint-plugin
- stylelint(.stylelintrc.js | .stylelintignore)
  - stylelint-config-css-modules
  - stylelint-config-idiomatic-order
  - stylelint-config-prettier-scss
  - stylelint-config-standard-scss
  - stylelint-declaration-block-no-ignored-properties
- commitlint(.commitlintrc.json)
  - @commitlint/cli
  - @commitlint/config-conventional
- plop(plopfile.js)
- typescript(tsconfig.json)
- postcss(postcss.config.js)
  - postcss-preset-env
- tailwind(tailwind.config.js)
- sass
- babel(babel.config.js)
  - @babel/core
  - @babel/preset-env
  - @babel/plugin-transform-runtime
  - @babel/runtime-corejs3
- browserslist(.browserslistrc)
- webpack(webpack.config.js)
  - webpack-cli
  - webpack-dev-server
  - webpack-chain
  - webpack-merge
  - thread-loader
  - babel-loader
  - css-loader
  - postcss-loader
  - sass-loader
  - style-loader
  - ts-loader
  - webpack-bundle-analyzer
  - dotenv-webpack
  - webpackbar
  - @soda/friendly-errors-webpack-plugin
  - html-webpack-plugin
  - copy-webpack-plugin
  - mini-css-extract-plugin
  - terser-webpack-plugin
- jest(jest.config.js)
  - ts-jest

### Vue

- eslint(.eslintrc.js | .eslintignore)
  - vue-eslint-parser
  - eslint-plugin-vue
- stylelint(.stylelintrc.js | .stylelintignore)
  - stylelint-config-html
  - stylelint-config-recommended-vue
- postcss(postcss.config.js)
  - postcss-html
- webpack(webpack.config.js)
  - vue-loader

### React

- eslint(.eslintrc.js | .eslintignore)
  - eslint-plugin-react
  - eslint-plugin-react-hooks
- babel(babel.config.js)
  - @babel/preset-react
- webpack(webpack.config.js)
  - file-loader
  - @svgr/webpack
