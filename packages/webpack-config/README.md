# @systemlight/webpack-config

[![NPM version](https://img.shields.io/npm/v/@systemlight/webpack-config.svg)](https://www.npmjs.com/package/@systemlight/webpack-config)

> Webpack smart configuration.

## 支持环境

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

## Usage

安装

```bash
npm i @systemlight/webpack-config webpack webpack-cli -D
or
yarn add @systemlight/webpack-config webpack webpack-cli -D
or
pnpm add @systemlight/webpack-config webpack webpack-cli -D
```

in `webpack.config.js`

```js
const {wcf} = require('@systemlight/webpack-config')

module.exports = wcf()
```

实例化构建方式

```js
const {webpack5RecommendConfig} = require('@systemlight/webpack-config')

module.exports = (env, argv) => new webpack5RecommendConfig(env, argv)
  .build(function (config) {
    if (this.isDevelopment) {
      // 修改内置的config内容，设置值内容会被自动merge
      config.value = {
        devtool: false
      }
    }
  })
  .toConfig();
```

参数配置

```javascript
const {wcf} = require('@systemlight/webpack-config');
const AgreedRoutingPlugin = require('./agreed-route-plugin');

module.exports = wcf({
  buildOptions: {
    postcss: true,
    emitCss: false,
    enableBabel: false,
    skipCheckBabel: true,
    define: {
      __VUE_OPTIONS_API__: true
    }
  },
  buildConfigCallback(config) {
    this.rebuildDexterity(false)
    config.plugins.push(new AgreedRoutingPlugin())
  }
})
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

> 创建配置实例对象

- new Webpack5RecommendConfig(env,argv,options) : 创建默认web项目，自检vue或者react
- Webpack5RecommendConfig.newLibrary(env, argv, libraryName, genCallback) : 创建类库项目
- Webpack5RecommendConfig.newReactLibrary(env, argv, libraryName, genCallback) : 创建react库项目
- Webpack5RecommendConfig.newNodeLibrary(env, argv, buildCallback) : 创建node库项目

> 实例对象方法

- build(buildCallback) : 执行构建方法，该方法会执行多个分块构建，接收buildCallback回调可以对webpack配置对象进行细节修改
- toConfig(debug) : 生成webpack配置对象并返回
- buildEnd() : 合并上面两个接口操作，返回配置数据

> Types

```javascript
/**
 * @typedef Webpack5RecommendConfigOptions
 * @property {String?} cwd - 当前运行webpack所在位置
 * @property {String?} srcPath - 源码目录文件位置
 * @property {String?} distPath - 输出文件位置
 * @property {Object?} packageJSONFilePath - package.json文件目录，绝对路径
 * @property {String?} staticFolderPath - 静态文件public目录
 *
 * @property {Boolean?} isTsProject - 是否为TS项目
 * @property {Boolean?} isEntryJSX - 定义入口文件是否是JSX或者TSX
 * @property {String?} scriptExt - 入口脚本扩展名称
 * @property {String?} entryDefaultName - 入口默认名,webpack默认入口为index.js，输出为main.js
 * @property {String | null?} entryDefaultFileName - 入口文件默认名称
 *
 * 所有enable开头的都是AutoVal类型，可以使用Boolean、auto、!auto、^auto
 * auto: 生产环境启用
 * !auto: 开发环境启用
 * ^auto: 无论什么环境，只要存在该选项的依赖包就启用
 * @property {AutoVal?} enableFriendly - 是否启用更加友好的提示，需要额外安装插件
 * @property {AutoVal?} enableProfile - 是否统计并打印webpack打包详细信息
 * @property {AutoVal?} enableProxy - 是否启用代理配置
 * @property {AutoVal?} enableMock - 是否mock数据代理配置
 * @property {AutoVal?} enableThread - 是否启用多线程
 * @property {AutoVal?} enableHash - 是否启用HASH
 * @property {AutoVal?} enableSplitChunk - 是否启用代码Chunk切分
 * @property {AutoVal?} enableBabel - 默认生产环境进行babel编译，如果你使用React JSX那么需要永久启用并添加@babel/preset-react
 * @property {AutoVal?} enablePostcss - 是否启用postcss解析样式
 * @property {AutoVal?} enableMinimize - 是否开启压缩代码
 * @property {AutoVal?} enableResolveCss - 是否解析样式文件
 * @property {AutoVal?} enableResolveAsset - 是否解析资源文件
 *
 * @property {Boolean?} emitHtml - 是否弹出HTML文件
 * @property {AutoVal?} emitCss - 是否分离css
 * @property {Boolean?} emitPublic - 是否复制public中静态文件
 *
 * @property {String | null?} title - 主页标题
 * @property {String?} publicPath - 发布时URL访问路径
 * @property {Boolean?} isNodeLibrary - 是否启用构建node库的环境配置
 * @property {LibraryName?} libraryName - 是否作为库函数进行发布
 * @property {String[]?} externals - 需要做排除的库，目前支持react
 * @property {Object?} define - 定义额外的一些字段内容，可以在项目中获取
 * @property {Boolean?} skipCheckBabel - 强制跳过babel启用检查
 * @property {MockServerMiddleware?} mockServer - mockServer中间件
 * @property {EachPlugin?} eachPlugin - 依次访问每个插件实例可以修改对象
 */

/**
 * @typedef {import('./types/config').WebpackOptionsNormalized} WebpackOptionsNormalized
 */

/**
 * @typedef {'auto' | '!auto' | Boolean} AutoVal
 */

/**
 * @typedef {Boolean | string | string[] | {amd?: string, commonjs?: string, root?: string | string[]}} LibraryName
 */

/**
 * @typedef {{name:string,constructor:any,args:any[]}} Plugin
 */

/**
 * @callback EachPlugin
 * @this Webpack5RecommendConfig
 * @param {Plugin} plugin
 * @return {void}
 */

/**
 * @callback GenCallback
 * @param {Webpack5RecommendConfigOptions[]} options - 配置选项
 * @return {void}
 */

/**
 * @callback BuildConfigCallback
 * @this Webpack5RecommendConfig
 * @param {{value:WebpackOptionsNormalized}} config
 * @return {void}
 */

/**
 * @callback MockServerMiddleware
 * @param {any} app - express实例
 * @return {void}
 */
```

### QA:

- 如何关闭HTML文件弹出？

默认会读取src/index.ejs文件作为模板，如果存在的话，想要关闭html文件弹出可以配置`emitHtml:false`

- 为什么使用vue时候options API不起效果？

> webpack5RecommendConfig保持现代化编程只支持vue3并且默认禁用optionsAPI，启用方法如下：

```javascript
const {Webpack5RecommendConfig: WebpackConfig} = require('@systemlight/webpack-config');

module.exports = (env, argv) => new WebpackConfig(env, argv, {
  define: {
    __VUE_OPTIONS_API__: true
  }
}).build().toConfig()
```

---

- 为什么安装webpack-config还要安装一堆插件？

> webpack-config只是为了更方便智能的生成webpack配置，所以插件版本需要用户自己安装和配置，webpack-config会自动识别并生成配置

---

- 如何配置mock服务？

`mock/index.js`

```javascript
const mocks = [
  // #auto-mock
]

module.exports = mocks
```

`webpack.config.js`

```javascript
const {Webpack5RecommendConfig} = require('@systemlight/webpack-config')
const {mockServer} = require('@systemlight/webpack-config-mockserver')

module.exports = (env, argv) => new webpack5RecommendConfig(env, argv, {
  enableMock: true,
  mockServer: mockServer
})
  .build()
  .toConfig()
```
