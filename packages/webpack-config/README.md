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
npm i @systemlight/webpack-config webpack webpack-cli -D
or
yarn add @systemlight/webpack-config webpack webpack-cli -D
or
pnpm add @systemlight/webpack-config webpack webpack-cli -D
```

### 示例

in `webpack.config.js`

```js
const {wcf} = require('@systemlight/webpack-config')

module.exports = wcf()
```

### Options

- [详情参考](src/interface/Webpack5RecommendConfigOptions.ts)

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

### 注意事项？

- 如果你在开发一个库或多项目仓库 (monorepo)，请注意导入 CSS 是具有副作用的。
- 请确保在 package.json 中移除 "sideEffects": false，
- 否则 CSS 代码块会在生产环境构建时被 webpack 丢掉
