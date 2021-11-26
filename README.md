# @systemlight/webpack-config

> Webpack common configuration.

# Use

安装

```bash
npm i @systemlight/webpack-config --save-dev
yarn add @systemlight/webpack-config -D
```

in `webpack.config.js`

```js
const webpackConfig = require('@systemlight/webpack-config');

module.exports = function (env, argv) {
    return webpackConfig(env, argv).toConfig();
};
```

## 支持环境

- [x] webpack
- [x] babel
- [x] mockjs
- [x] typescript
- [x] less
- [ ] scss
- [x] postcss
- [x] react
- [ ] vue2
- [ ] vue3
