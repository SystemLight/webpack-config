# @systemlight/webpack-config

> Webpack common configuration.

### 支持环境

- [x] webpack5
- [x] babel
- [x] mockjs
- [x] typescript
- [x] css
- [x] less
- [x] sass
- [x] postcss
- [x] react
- [ ] vue2
- [ ] vue3 

### Usage

```bash
npm i @systemlight/webpack-config -D
yarn add @systemlight/webpack-config -D
pnpm add @systemlight/webpack-config -D
```

in `webpack.config.js`

```js
// 更多使用配置方法请参考源码
const webpack5RecommendConfig = require('@systemlight/webpack-config')

module.exports = (env, argv) => new webpack5RecommendConfig(env, argv)
  .build(function (config) {
    if (this.isDevelopment) {
      config.devtool = false
    }
  })
  .toConfig();
```

in `package.json`

```json
{
    "scripts": {
      "build:webpack": "webpack --mode production",
      "build:webpack-dev": "webpack --mode development",
      "dev:serve": "webpack serve --mode development",
    }
}
```
