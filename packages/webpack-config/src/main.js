const path = require('path')
const fs = require('fs')
const {createRequire} = require('module')

const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const {mockServer} = require('@systemlight/webpack-config-mockserver')
const {merge} = require('webpack-merge')

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
 * @typedef {'auto' | '!auto' | '^auto' | Boolean} AutoVal
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

class Webpack5RecommendConfig {
  // 如果你在开发一个库或多项目仓库 (monorepo)，请注意导入 CSS 是具有副作用的。
  // 请确保在 package.json 中移除 "sideEffects": false，
  // 否则 CSS 代码块会在生产环境构建时被 webpack 丢掉

  /**
   * webpack配置项：https://webpack.js.org/configuration/
   * 为什么不用Dll：https://github.com/facebook/create-react-app/pull/2710#issuecomment-378523967
   * @param {String?} mode - 模式
   * @param {Boolean?} isStartSever - 是否启动服务器
   * @param {Webpack5RecommendConfigOptions[] | Webpack5RecommendConfigOptions?} options - 配置选项
   */
  constructor(mode, isStartSever, options) {
    this.mode = mode || 'development'
    this.isProduction = this.mode === 'production'
    this.isDevelopment = !this.isProduction
    this.isStartSever = !!isStartSever

    const cwd = process.cwd()
    const isTsProject = fs.existsSync(path.resolve(cwd, 'tsconfig.json'))
    const _options = {
      cwd: cwd,
      srcPath: path.resolve(cwd, 'src'),
      distPath: path.resolve(cwd, 'dist'),
      packageJSONFilePath: path.resolve(cwd, 'package.json'),
      staticFolderPath: path.resolve(cwd, 'public'),

      isTsProject: isTsProject,
      isEntryJSX: false,
      scriptExt: isTsProject ? '.ts' : '.js',
      entryDefaultName: 'main',
      entryDefaultFileName: null,

      // 所有enable开头的都是AutoVal类型，可以使用Boolean或者auto或者!auto，auto为生产环境启用
      enableFriendly: true,
      enableProfile: false,
      enableProxy: false,
      enableMock: false,
      enableThread: false,
      enableHash: false,
      enableSplitChunk: false,
      enableBabel: false,
      enablePostcss: false,
      enableMinimize: false,
      enableResolveCss: '^auto',
      enableResolveAsset: true,

      emitHtml: true,
      emitCss: false,
      emitPublic: true,

      title: null,
      publicPath: '/',
      isNodeLibrary: false,
      libraryName: false,
      externals: [],
      define: {},
      skipCheckBabel: false,
      mockServer: mockServer,
      eachPlugin: null
    }

    // 解析options参数，完成多态
    if (Array.isArray(options)) {
      if (options.length === 1) {
        Object.assign(_options, options[0])
      } else if (options.length === 2) {
        if (this.isProduction) {
          Object.assign(_options, options[0]) // 生产配置
        } else {
          Object.assign(_options, options[1]) // 开发配置
        }
      } else if (options.length === 3) {
        if (this.isProduction) {
          Object.assign(_options, options[0], options[1]) // 生产配置
        } else {
          Object.assign(_options, options[0], options[2]) // 开发配置
        }
      } else {
        throw TypeError('Incorrect number of options parameters.')
      }
    } else if (typeof options === 'object') {
      Object.assign(_options, options)
    }

    this.require = createRequire(_options.packageJSONFilePath)
    this.cwd = _options.cwd
    this.srcPath = _options.srcPath
    this.distPath = _options.distPath
    this.packageJSONFilePath = _options.packageJSONFilePath
    this.packageJSON = require(_options.packageJSONFilePath)
    this.dependencies = Object.keys({
      // 项目依赖库数组，用于判定包含什么框架
      ...this.packageJSON['devDependencies'],
      ...this.packageJSON['dependencies']
    })
    this.staticFolderPath = _options.staticFolderPath

    this.isTsProject = _options.isTsProject
    this.isEntryJSX = _options.isEntryJSX
    this.scriptExt = _options.scriptExt
    if (this.isEntryJSX === true || (this.isEntryJSX === 'auto' && this.isInclude('react'))) {
      this.scriptExt += 'x'
    }
    this.entryDefaultName = _options.entryDefaultName
    this.entryDefaultFileName = _options.entryDefaultFileName || `${this.entryDefaultName}${this.scriptExt}`

    this.enableFriendly = this.autoVal(_options.enableFriendly)
    this.enableProfile = this.autoVal(_options.enableProfile)
    this.enableProxy = this.autoVal(_options.enableProxy)
    this.enableMock = this.autoVal(_options.enableMock)
    this.enableThread = this.autoVal(_options.enableThread, ['thread-loader'])
    this.enableHash = this.autoVal(_options.enableHash)
    this.enableSplitChunk = this.autoVal(_options.enableSplitChunk)
    this.enableBabel = this.autoVal(_options.enableBabel)
    this.enablePostcss = this.autoVal(_options.enablePostcss, ['postcss-loader', 'css-loader', 'style-loader'])
    this.enableMinimize = this.autoVal(_options.enableMinimize)
    this.enableResolveCss = this.autoVal(_options.enableResolveCss, ['css-loader', 'style-loader'])
    this.enableResolveAsset = this.autoVal(_options.enableResolveAsset)

    this.emitCss = this.autoVal(_options.emitCss)
    this.emitHtml = _options.emitHtml
    this.emitPublic = _options.emitPublic

    this.title = _options.title || this.packageJSON['name'] || 'Webpack App'
    this.publicPath = _options.publicPath
    this.isNodeLibrary = _options.isNodeLibrary
    this.libraryName = _options.libraryName
    if (this.libraryName === true) {
      this.libraryName = this.camelCase(this.packageJSON['name']) || 'library'
    }
    this.externals = _options.externals
    this.define = _options.define
    this.skipCheckBabel = _options.skipCheckBabel
    this.mockServer = _options.mockServer
    this.eachPlugin = _options.eachPlugin

    /**
     * webpack配置对象
     * @private
     * @type {WebpackOptionsNormalized}
     */
    this._config = {}
    this._webpack = webpack

    if (this.isProduction) {
      // 生产环境检查是否开启babel-loader
      this.checkEnableBabel()
    }
    if (!this.isTsProject && this.isInclude('react')) {
      // 不是ts项目时包含了react检查是否开启babel-loader
      this.checkEnableBabel(false)
    }
    if (this.enableBabel) {
      // 启用react时检查是否需要完成react项目编译
      this.checkBabelCompileReact()
    }
  }

  /**
   * 获取库构建参数
   * @param {LibraryName?} libraryName
   * @param {GenCallback?} genCallback
   * @returns {Webpack5RecommendConfigOptions[]}
   */
  static genLibraryOptions(libraryName, genCallback) {
    let options = [
      {
        emitCss: false,
        emitHtml: false,
        libraryName: libraryName || true,
        enableSplitChunk: false,
        enableHash: false
      },
      {emitPublic: false},
      {}
    ]
    if (typeof genCallback === 'function') {
      genCallback(options)
    }
    return options
  }

  /**
   * 创建Webpack5RecommendConfig
   * @param {String?} mode - 模式
   * @param {Boolean?} isStartSever - 是否启动服务器
   * @param {LibraryName?} libraryName
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfig}
   */
  static newLibrary(mode, isStartSever, libraryName, genCallback) {
    return new Webpack5RecommendConfig(
      mode,
      isStartSever,
      Webpack5RecommendConfig.genLibraryOptions(libraryName, genCallback)
    )
  }

  /**
   * 获取node库构建参数
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfigOptions[]}
   */
  static genNodeOptions(genCallback) {
    return Webpack5RecommendConfig.genLibraryOptions('library', (options) => {
      options[0].enableResolveCss = false
      options[0].enableResolveAsset = false
      options[0].emitPublic = false
      options[0].isNodeLibrary = true
      if (typeof genCallback === 'function') {
        genCallback(options)
      }
    })
  }

  /**
   * 创建Webpack5RecommendConfig
   * @param {String?} mode - 模式
   * @param {Boolean?} isStartSever - 是否启动服务器
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfig}
   */
  static newNodeLibrary(mode, isStartSever, genCallback) {
    return new Webpack5RecommendConfig(mode, isStartSever, Webpack5RecommendConfig.genNodeOptions(genCallback))
  }

  /**
   * 获取React库构建参数
   * @param {LibraryName?} libraryName
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfigOptions[]}
   */
  static genReactLibraryOptions(libraryName, genCallback) {
    return Webpack5RecommendConfig.genLibraryOptions(libraryName, (options) => {
      options[0].externals = ['react']
      if (typeof genCallback === 'function') {
        genCallback(options)
      }
    })
  }

  /**
   * 创建Webpack5RecommendConfig
   * @param {String?} mode - 模式
   * @param {Boolean?} isStartSever - 是否启动服务器
   * @param {LibraryName?} libraryName
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfig}
   */
  static newReactLibrary(mode, isStartSever, libraryName, genCallback) {
    return new Webpack5RecommendConfig(
      mode,
      isStartSever,
      Webpack5RecommendConfig.genReactLibraryOptions(libraryName, genCallback)
    )
  }

  /**
   * [all build]->[build callback]
   * 调用所有默认构建方法，并且可以传入最终处理构建回调
   * @param {BuildConfigCallback?} buildCallback
   * @return {Webpack5RecommendConfig}
   */
  build(buildCallback) {
    // webpack5配置文档：https://webpack.js.org/configuration/
    this.buildBasic()
    this.buildInsAndOuts()
    this.buildExternals()
    this.buildResolve()
    this.buildDevServer()
    this.buildImprove()
    this.buildRules()
    this.buildPlugins()

    if (this.isNodeLibrary) {
      this.rebuildNodeLibrary()
    }

    this.buildCallback(buildCallback)

    return this
  }

  buildBasic() {
    this._config.mode = this.mode
    this._config.stats = 'errors-only'
    this._config.infrastructureLogging = {level: 'error'}
    // 保持和 @vue/cli-service 同款默认项
    this._config.devtool = this.isDevelopment ? 'eval-cheap-module-source-map' : false
    this._config.context = this.cwd
    if (this.isDevelopment) {
      this._config.target = 'web' // 默认值：browserslist
    }

    return this
  }

  buildInsAndOuts() {
    this._config.entry = {
      [this.entryDefaultName]: path.resolve(this.srcPath, this.entryDefaultFileName)
    }

    this._config.output = {
      path: this.distPath,
      publicPath: this.publicPath,
      compareBeforeEmit: false,
      iife: true,
      clean: true
    }

    if (this.enableHash) {
      Object.assign(this._config.output, {
        filename: '[name].bundle.[chunkhash:8].js',
        chunkFilename: '[name].chunk.[chunkhash:8].js',
        assetModuleFilename: 'assets/[name][hash:8][ext]'
      })
    } else {
      Object.assign(this._config.output, {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        assetModuleFilename: 'assets/[name][ext]'
      })
    }

    // https://webpack.js.org/configuration/output/#outputlibrary
    if (this.libraryName !== false) {
      // true会被转换成自动名称，到不了这里
      this._config.output.globalObject = 'this'
      this._config.output.library = {
        name: this.libraryName, // 如果不想要名称可以设置null
        // https://webpack.js.org/configuration/output/#outputlibrarytype
        type: 'umd2',
        export: 'default', // 如果想导出空间中所有内容，delete config.output.library.export
        umdNamedDefine: true,
        auxiliaryComment: {
          root: 'Root Export',
          commonjs: 'CommonJS Export',
          commonjs2: 'CommonJS2 Export',
          amd: 'AMD Export'
        }
      }
    }

    return this
  }

  buildExternals() {
    // https://webpack.js.org/configuration/externals/
    this._config.externals = {}

    if (this.externals.includes('react')) {
      Object.assign(this._config.externals, {
        react: {
          root: 'React',
          commonjs: 'react',
          commonjs2: 'react',
          amd: 'react'
        },
        'react-dom': {
          root: 'ReactDOM',
          commonjs: 'react-dom',
          commonjs2: 'react-dom',
          amd: 'react-dom'
        }
      })
    }

    return this
  }

  buildResolve() {
    this._config.resolve = {
      extensions: ['.js'],
      alias: {
        '@': this.srcPath
      }
    }

    if (this.isTsProject) {
      this._config.resolve.extensions.push('.ts')
    }

    if (this.isInclude('react')) {
      this._config.resolve.extensions.push('.jsx')
      if (this.isTsProject) {
        this._config.resolve.extensions.push('.tsx')
      }
    }

    if (this.isInclude('vue')) {
      this._config.resolve.extensions.push('.vue')
    }

    return this
  }

  buildDevServer() {
    // https://webpack.js.org/configuration/dev-server/
    const port = 8080
    this._config.devServer = {
      allowedHosts: 'all',
      historyApiFallback: false, // https://github.com/bripkens/connect-history-api-fallback
      host: '0.0.0.0',
      liveReload: true,
      hot: false, // HMR（Hot Module Replacement），JS文件内需要调用accept()
      open: [`http://localhost:${port}/`],
      port: port,
      magicHtml: false,
      // https://github.com/webpack/webpack-dev-middleware
      client: {
        logging: 'error'
      },
      devMiddleware: {
        stats: false
      }
    }

    if (this.enableProxy) {
      this._config.devServer.proxy = this.configProxy()
    }

    if (this.enableMock) {
      this._config.devServer.setupMiddlewares = (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined')
        }

        this.configMock(devServer.app)

        return middlewares
      }
    }

    return this
  }

  buildImprove() {
    this._config.performance = {
      hints: 'warning',
      maxAssetSize: (this.isProduction ? 3 : 30) * 1024 * 1024,
      maxEntrypointSize: (this.isProduction ? 3 : 30) * 1024 * 1024
    }

    this._config.optimization = {}
    if (this.enableSplitChunk) {
      /**
       * https://webpack.js.org/plugins/split-chunks-plugin/#configuration
       *
       * 产生chunk的3种方式
       * 1. 手动设置规则进行切割
       * 2. 多个入口文件会被当成多个Chunk处理
       * 3. 使用import()进行异步导入
       */
      this._config.optimization.splitChunks = {
        /**
         * all: 所有方式引入的Module中的符合手动切割Chunk规则的Module都会被解析分离
         * initial: 异步引入的Module中符合手动切割Chunk规则的Module不做解析分离
         * async: 同步引入的Module中符合手动切割Chunk规则的Module不做解析分离
         */
        chunks: 'all',
        automaticNameDelimiter: '~',
        cacheGroups: this.getSplitChunksGroup()
      }

      if (this.isProduction) {
        this._config.optimization.runtimeChunk = 'single'
      }
    }

    if (this.enableMinimize) {
      Object.assign(this._config.optimization, {
        minimize: this.enableMinimize,
        minimizer: [
          new TerserWebpackPlugin() // 压缩器
        ]
      })
    }

    return this
  }

  buildRules() {
    this._config.module = {rules: []}

    /**
     * 添加js解析
     */
    let jsUse = this.enableBabel ? ['babel-loader'] : []
    if (this.enableThread) {
      jsUse.unshift('thread-loader')
    }
    this._config.module.rules.push({
      test: /\.js$/,
      exclude: /[\\/]node_modules[\\/]/,
      use: jsUse
    })

    if (this.isInclude('react')) {
      /**
       * 添加jsx解析
       */
      let jsxUse = this.enableBabel ? ['babel-loader'] : []
      if (this.enableThread) {
        jsxUse.unshift('thread-loader')
      }
      this._config.module.rules.push({
        test: /\.jsx$/,
        use: jsxUse
      })
    }

    if (this.isTsProject) {
      /**
       * 添加ts/tsx解析
       */
      let tsUse = this.enableBabel ? ['babel-loader'] : []

      let jsx = 'preserve'
      if (!this.enableBabel && this.isInclude('react')) {
        jsx = 'react-jsxdev'
      }

      let appendTsSuffixTo = []
      if (this.isInclude('vue')) {
        appendTsSuffixTo.push(/\.vue$/)
      }

      tsUse.push({
        loader: 'ts-loader',
        options: {
          // https://github.com/TypeStrong/ts-loader#happypackmode
          happyPackMode: this.enableThread,
          transpileOnly: true,
          appendTsSuffixTo: appendTsSuffixTo,
          compilerOptions: {
            jsx: jsx,
            noEmit: true
          }
        }
      })
      if (this.enableThread) {
        tsUse.unshift('thread-loader')
      }
      this._config.module.rules.push({
        test: /\.tsx?$/,
        use: tsUse
      })
    }

    if (this.isInclude('vue')) {
      this._config.module.rules.push({
        test: /\.vue$/,
        use: ['vue-loader']
      })
    }

    if (this.enableResolveCss) {
      /**
       * 添加css解析
       */
      this._config.module.rules.push({
        test: /\.css$/,
        use: this.getCssLoader()
      })

      /**
       * 添加sass解析
       */
      if (this.isInclude('sass')) {
        this._config.module.rules.push({
          test: /\.s[ca]ss$/,
          use: this.getCssLoader('sass')
        })
      }

      /**
       * 添加less解析
       */
      if (this.isInclude('less')) {
        this._config.module.rules.push({
          test: /\.less$/,
          use: this.getCssLoader('less')
        })
      }

      /**
       * 添加stylus解析
       */
      if (this.isInclude('stylus')) {
        this._config.module.rules.push({
          test: /\.styl$/,
          use: this.getCssLoader('stylus')
        })
      }
    }

    if (this.enableResolveAsset) {
      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加图片资源解析
       */
      this._config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset',
        generator: {
          filename: this.enableHash ? 'images/[name].[hash:8][ext]' : 'images/[name][ext]'
        }
      })

      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加媒体资源解析
       */
      this._config.module.rules.push({
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: this.enableHash ? 'media/[name].[hash:8][ext]' : 'images/[name][ext]'
        }
      })

      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加字体资源解析
       */
      this._config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset',
        generator: {
          filename: this.enableHash ? 'font/[name].[hash:8][ext]' : 'images/[name][ext]'
        }
      })
    }

    return this
  }

  buildPlugins() {
    this._config.plugins = []

    if (this.emitCss) {
      /**
       * 将 CSS 提取到单独的文件中
       * https://webpack.js.org/plugins/mini-css-extract-plugin/
       */
      this.pushPlugin(
        new MiniCssExtractPlugin({
          filename: this.enableHash ? '[name].style.[chunkhash:8].css' : '[name].style.css'
        })
      )
    }

    /**
     * 自动添加HTML插件
     * https://github.com/jantimon/html-webpack-plugin
     */
    if (this.emitHtml) {
      let htmWebpackPluginOptions = {
        title: this.title,
        filename: 'index.html',
        inject: 'body',
        scriptLoading: 'defer', // 'blocking'|'defer'|'module'
        hash: false,
        // https://github.com/terser/html-minifier-terser
        minify: this.isProduction
          ? {
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true
          }
          : false
      }
      this.pushPlugin(new HtmlWebpackPlugin(htmWebpackPluginOptions))
    }

    if (this.emitPublic && fs.existsSync(this.staticFolderPath)) {
      /**
       * 将已存在的单个文件或整个目录复制到构建目录
       * https://webpack.js.org/plugins/copy-webpack-plugin
       */
      this.pushPlugin(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: this.staticFolderPath,
              to: '.'
            }
          ]
        })
      )
    }

    if (this.enableFriendly) {
      if (this.enableProfile) {
        /**
         * Elegant ProgressBar and Profiler for Webpack 3 , 4 and 5
         * https://github.com/unjs/webpackbar
         */
        this.pushPlugin(
          new WebpackBar({
            reporters: ['fancy', 'profile'],
            profile: true
          })
        )
      } else {
        this.pushPlugin(new WebpackBar())
      }
    }

    if (this.enableFriendly && this.isStartSever) {
      this.pushPlugin(
        new FriendlyErrorsWebpackPlugin({
          compilationSuccessInfo: {
            messages: [`You application is running here http://localhost:${this._config.devServer.port}`]
          }
        })
      )
    }

    if (this.isInclude('vue')) {
      /**
       * 加载vue文件必须插件
       */
      const {VueLoaderPlugin} = this.require('vue-loader')
      this.pushPlugin('VueLoaderPlugin', VueLoaderPlugin, [])
    }

    /**
     * 允许在编译时配置全局常量
     * https://webpack.js.org/plugins/define-plugin
     */
    if (this.isInclude('vue')) {
      // https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
      this.define = Object.assign(
        {
          __VUE_OPTIONS_API__: false,
          __VUE_PROD_DEVTOOLS__: this.isDevelopment
        },
        this.define
      )
    }
    this.pushPlugin('_webpack.DefinePlugin', this._webpack.DefinePlugin, [this.define])

    /**
     * 在监视模式下忽略指定的文件
     * https://webpack.js.org/plugins/watch-ignore-plugin/
     */
    if (this.isTsProject) {
      let ignorePaths = []
      // https://github.com/TypeStrong/ts-loader#usage-with-webpack-watch
      ignorePaths.push(/\.js$/, /\.d\.ts$/)
      this.pushPlugin('_webpack.WatchIgnorePlugin', this._webpack.WatchIgnorePlugin, [
        {
          paths: ignorePaths
        }
      ])
    }

    return this
  }

  /**
   * [build callback]
   * 传入最终处理构建回调
   * @param {BuildConfigCallback?} callback
   * @return {Webpack5RecommendConfig}
   */
  buildCallback(callback) {
    if (typeof callback === 'function') {
      const that = this
      const _configRef = {}
      Object.defineProperty(_configRef, 'value', {
        configurable: false,
        enumerable: true,
        get() {
          return that._config
        },
        set(value) {
          that.mergeConfig(value)
        }
      })
      callback.call(this, _configRef)
    }

    return this
  }

  /**
   * [all build]->[build callback]->[config]
   * 调用所有默认构建方法，同时返回配置文件对象
   * @param {BuildConfigCallback?} buildCallback
   * @param {Boolean?} debug
   * @return {WebpackOptionsNormalized}
   */
  buildEnd(buildCallback, debug) {
    return this.build(buildCallback).toConfig(debug)
  }

  /**
   * [build callback]->[config]
   * 传入最终处理构建回调，返回配置文件对象
   * @param {BuildConfigCallback?} buildCallback
   * @param {Boolean?} debug
   * @return {WebpackOptionsNormalized}
   */
  end(buildCallback, debug) {
    this.buildCallback(buildCallback)
    return this.toConfig(debug)
  }

  rebuildNodeLibrary() {
    this._config.target = 'node'
    this._config.output.library.name = undefined
    this._config.output.library.type = 'commonjs2'
    this._config.output.library.export = undefined
  }

  rebuildDexterity(vueRuntime = true) {
    this._config.devtool = false
    this._config.devServer.open = false
    this._config.devServer.historyApiFallback = true
    if (this.isInclude('vue') && !vueRuntime) {
      this._config.resolve.alias['vue'] = 'vue/dist/vue.esm-bundler.js'
    }
  }

  /**
   * 返回auto对应的值
   * @param {AutoVal?} value
   * @param {String[]} dependencies
   * @return {Boolean}
   */
  autoVal(value, dependencies = []) {
    if (value === 'auto') {
      value = this.isProduction
    } else if (value === '!auto') {
      value = this.isDevelopment
    } else if (value === '^auto') {
      value = dependencies.every(this.isInclude.bind(this))
    }
    if (value && !dependencies.every(this.isInclude.bind(this))) {
      throw TypeError('missing dependencies ' + dependencies)
    }
    return !!value
  }

  camelCase(content) {
    if (!content) {
      return ''
    }
    return content
      .split('/')
      .slice(-1)[0]
      .replace(/-(\w)/g, (_, $1) => $1.toUpperCase())
  }

  /**
   * 推入配置文件插件，该方法推入的插件会触发eachPlugin
   * @param {string | Object} name
   * @param {Function | any[]?} constructor
   * @param {any[]?} args
   */
  pushPlugin(name, constructor, args) {
    if (typeof name !== 'string') {
      this._config.plugins.push(name)
      return
    }

    let plugin = {name}
    if (Array.isArray(constructor)) {
      plugin.constructor = this.require(name)
      plugin.args = constructor
    } else if (typeof constructor === 'function') {
      plugin.constructor = constructor
      plugin.args = args || []
    } else {
      throw TypeError('unsupported constructor')
    }

    if (typeof this.eachPlugin === 'function') {
      this.eachPlugin(plugin)
    }

    this._config.plugins.push(new plugin.constructor(...plugin.args))
  }

  isInclude(libraryName) {
    return this.dependencies.includes(libraryName)
  }

  checkEnableBabel(isWarn = true) {
    if (!this.skipCheckBabel && !this.enableBabel) {
      const msg = 'Please start Babel in the production environment to compile.'
      if (isWarn) {
        console.warn('[WARN]-' + msg)
      } else {
        throw TypeError(msg)
      }
    }
  }

  checkBabelCompileReact() {
    if (this.isInclude('react') && !this.isInclude('@babel/preset-react')) {
      throw TypeError('Please add and configure @babel/preset-react in Babel to compile the react project.')
    }
  }

  getSplitChunksGroup() {
    // 内置定义Chunk切割分离规则
    let cacheGroups = {
      common: {
        name: 'common',
        minChunks: 2,
        reuseExistingChunk: true,
        priority: -20
      },
      vendors: {
        name: 'vendors',
        test: /[\\/]node_modules[\\/]/,
        priority: -10
      }
    }

    if (this.isInclude('react')) {
      Object.assign(cacheGroups, {
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)/,
          chunks: 'all'
        }
      })
    }

    if (this.isInclude('antd')) {
      cacheGroups = Object.assign(cacheGroups, {
        antd: {
          name: 'antd',
          test: /[\\/]node_modules[\\/](@ant-design|antd)/,
          chunks: 'all'
        }
      })
    }

    if (this.isInclude('vue')) {
      Object.assign(cacheGroups, {
        vue: {
          name: 'vue',
          test: /[\\/]node_modules[\\/](@?vue|vue-router|vuex)/,
          chunks: 'all',
          enforce: true
        }
      })
    }

    if (this.isInclude('element-ui')) {
      Object.assign(cacheGroups, {
        elementUI: {
          name: 'element-ui',
          test: /[\\/]node_modules[\\/](element-ui)/,
          chunks: 'all'
        }
      })
    }

    return cacheGroups
  }

  getCssLoader(cssPreprocessing) {
    let cssRuleLoaders = []

    if (this.emitCss) {
      cssRuleLoaders.push(MiniCssExtractPlugin.loader)
    } else {
      cssRuleLoaders.push('style-loader')
    }

    cssRuleLoaders.push('css-loader')

    if (this.enablePostcss === true) {
      cssRuleLoaders.push('postcss-loader')
    }

    switch (cssPreprocessing) {
      case 'sass':
        cssRuleLoaders.push('sass-loader')
        break
      case 'less':
        cssRuleLoaders.push('less-loader')
        break
      case 'stylus':
        cssRuleLoaders.push('stylus-loader')
    }

    return cssRuleLoaders
  }

  configProxy() {
    return {
      // https://github.com/chimurai/http-proxy-middleware
      '/api': {
        target: 'http://localhost:5000/api',
        changeOrigin: true,
        secure: false
      }
    }
  }

  configMock(app) {
    if (typeof this.mockServer === 'function') {
      this.mockServer(app)
    } else {
      const mockServerPath = path.resolve(this.cwd, 'mock/mock-server.js')
      if (fs.existsSync(mockServerPath)) {
        require(mockServerPath)(app)
      }
    }
  }

  mergeConfig(firstConfiguration, ...config) {
    if (Array.isArray(firstConfiguration)) {
      firstConfiguration.unshift(this._config)
      this._config = merge(firstConfiguration)
    } else {
      this._config = merge(this._config, firstConfiguration, ...config)
    }
  }

  setConfig(config) {
    this._config = config
  }

  toConfig(debug) {
    if (debug) {
      console.log(this._config)
    }
    return this._config
  }
}

/**
 * WebpackConfigFactory
 * @param {{debug:boolean?,buildOptions:Webpack5RecommendConfigOptions[] | Webpack5RecommendConfigOptions?,buildConfigCallback:BuildConfigCallback?}?} options
 * @return {any}
 */
function wcf(options) {
  const _options = {debug: false, buildOptions: {}, buildConfigCallback: null}
  Object.assign(_options, options)
  return (env, argv) => {
    const mode = argv.mode || 'development'
    const isStartSever = !!env['WEBPACK_SERVE']
    const {debug, buildOptions, buildConfigCallback} = _options
    return new Webpack5RecommendConfig(mode, isStartSever, buildOptions).buildEnd(buildConfigCallback, debug)
  }
}

module.exports = {
  Webpack5RecommendConfig,
  wcf
}
