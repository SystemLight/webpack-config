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
- [x] react18
- [x] vue3 

### Usage

```bash
npm i @systemlight/webpack-config webpack webpack-cli webpack-dev-server webpackbar html-webpack-plugin -D
yarn add @systemlight/webpack-config webpack webpack-cli webpack-dev-server webpackbar html-webpack-plugin -D
pnpm add @systemlight/webpack-config webpack webpack-cli webpack-dev-server webpackbar html-webpack-plugin -D
```

in `webpack.config.js`

```js
const webpack5RecommendConfig = require('@systemlight/webpack-config')

// Webpack5RecommendConfigOptions - 第三个参数options配置内容
/**
 * @typedef Webpack5RecommendConfigOptions
 * @property {String?} cwd - 当前运行webpack所在位置
 * @property {String?} srcPath - 源码目录文件位置
 * @property {String?} distPath - 输出文件位置
 * @property {Object?} packageJSON - package.json文件信息对象
 * @property {String?} staticFolderPath - 静态文件public目录
 * @property {Boolean?} isTsProject - 是否为TS项目
 * @property {Boolean?} isEntryJSX - 定义入口文件是否是JSX或者TSX
 * @property {String?} scriptExt - 入口脚本扩展名称
 * @property {String?} entryDefaultName - 入口默认名,webpack默认入口为index.js，输出为main.js
 * @property {String | null?} entryDefaultFileName - 入口文件默认名称
 * @property {Boolean?} enableProfile - 是否统计并打印webpack打包详细信息
 * @property {Boolean?} enableProxy - 是否启用代理配置
 * @property {Boolean?} enableMock - 是否mock数据代理配置
 * @property {Boolean?} enableThread - 是否启用多线程
 * @property {Boolean?} enableHash - 是否启用HASH
 * @property {Boolean?} enableSplitChunk - 是否启用代码Chunk切分
 * @property {Boolean?} enableBabel - 默认生产环境进行babel编译，如果你使用React JSX那么需要永久启用并添加@babel/preset-react
 * @property {Boolean?} enableMinimize - 是否开启压缩代码
 * @property {Boolean?} enableResolveCss - 是否解析样式文件
 * @property {Boolean?} enableResolveAsset - 是否解析资源文件
 * @property {Boolean?} enableBuildNodeLibrary - 是否启用构建node库的环境配置
 * @property {Boolean?} emitHtml - 是否弹出HTML文件
 * @property {Boolean?} emitCss - 是否分离css
 * @property {Boolean?} emitPublic - 是否复制public中静态文件
 * @property {String | null?} title - 主页标题
 * @property {String?} publicPath - 发布时URL访问路径
 * @property {Boolean | 'auto'?} libraryName - 是否作为库函数进行发布
 * @property {String[]?} externals - 需要做排除的库，目前支持react
 * @property {Object?} define - 定义额外的一些字段内容，可以在项目中获取
 * @property {Boolean?} skipCheckBabel - 强制跳过babel启用检查
 * @property {MockServerMiddleware?} mockServer - mockServer中间件
 */

/**
 * @callback BuildCallback
 * @param {Webpack5RecommendConfigOptions[]} options - 配置选项
 * @return {void}
 */

/**
 * @callback MockServerMiddleware
 * @param {any} app - express实例
 * @return {void}
 */
 
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
      "dev:serve": "webpack serve --mode development"
    }
}
```

### API

- new webpack5RecommendConfig(...) : 创建默认web项目，自检vue或者react
- webpack5RecommendConfig.newLibrary(...) : 创建类库项目
- webpack5RecommendConfig.newReactLibrary(...) : 创建react库项目
- webpack5RecommendConfig.newNodeLibrary(...) : 创建node库项目
