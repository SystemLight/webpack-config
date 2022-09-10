# @systemlight/webpack-config

[![NPM version](https://img.shields.io/npm/v/@systemlight/webpack-config.svg)](https://www.npmjs.com/package/@systemlight/webpack-config)

> Webpack smart configuration.

## Support

- [x] webpack5
- [x] babel
- [x] mockjs
- [x] typescript
- [x] css
- [x] postcss
- [x] sass
- [x] less
- [x] stylus
- [x] react
- [x] vue

## Usage

### Install

```bash
npm i @systemlight/webpack-config webpack -D
or
yarn add @systemlight/webpack-config webpack -D
or
pnpm add @systemlight/webpack-config webpack -D
```

### Usage

初始化 `webpack.config.js`

```bash
wcf init
```

### Options

所有配置项都是智能检测环境生成默认值，无特殊要求不需要配置

- [使用教程](https://juejin.cn/post/7139735372237373471)
- [examples](https://github.com/SystemLight/T-webpack5)
- [API](src/interface/Webpack5RecommendConfigOptions.ts)

## 注意事项？

- 如果你在开发一个库或多项目仓库 (monorepo)，请注意导入 CSS 是具有副作用的。
- 请确保在 package.json 中移除 "sideEffects": false，
- 否则 CSS 代码块会在生产环境构建时被 webpack 丢掉
