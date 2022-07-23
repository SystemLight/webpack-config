const path = require('path')
const fs = require('fs')
const {createRequire} = require('module')

/**
 * @typedef Webpack5RecommendConfigOptions
 * @property {String?} cwd - 当前运行webpack所在位置
 * @property {String?} srcPath - 源码目录文件位置
 * @property {String?} distPath - 输出文件位置
 * @property {Object?} packageJSONFilePath - package.json文件目录，绝对路径
 * @property {String?} staticFolderPath - 静态文件public目录
 * @property {Boolean?} isTsProject - 是否为TS项目
 * @property {Boolean?} isEntryJSX - 定义入口文件是否是JSX或者TSX
 * @property {String?} scriptExt - 入口脚本扩展名称
 * @property {String?} entryDefaultName - 入口默认名,webpack默认入口为index.js，输出为main.js
 * @property {String | null?} entryDefaultFileName - 入口文件默认名称
 * @property {Boolean?} enableFriendly - 是否启用更加友好的提示，需要额外安装插件
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
 * @property {LibraryName?} libraryName - 是否作为库函数进行发布
 * @property {Boolean | 'auto'?} postcss - 是否启用postcss解析样式
 * @property {String[]?} externals - 需要做排除的库，目前支持react
 * @property {Object?} define - 定义额外的一些字段内容，可以在项目中获取
 * @property {Boolean?} skipCheckBabel - 强制跳过babel启用检查
 * @property {MockServerMiddleware?} mockServer - mockServer中间件
 * @property {EachPlugin?} eachPlugin - 依次访问每个插件实例可以修改对象
 */

/**
 * @typedef {Boolean | string | string[] | {amd?: string, commonjs?: string, root?: string | string[]}} LibraryName
 */

/**
 * @typedef {{name:string,constructor:any,args:any[]}} Plugin
 */

/**
 * @callback EachPlugin
 * @param {Plugin} plugin
 * @return {void}
 */

/**
 * @callback GenCallback
 * @param {Webpack5RecommendConfigOptions[]} options - 配置选项
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
   * @param {any[]} env - webpack环境变量对象
   * @param {Object} argv - 调用参数
   * @param {'development' | 'production'} argv.mode
   * @param {Webpack5RecommendConfigOptions[] | Webpack5RecommendConfigOptions?} options - 配置选项
   */
  constructor(env, argv, options) {
    this.mode = argv.mode || 'development'
    this.isProduction = this.mode === 'production'
    this.isDevelopment = !this.isProduction
    this.isStartSever = !!env['WEBPACK_SERVE']

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

      enableFriendly: false,
      enableProfile: false,
      enableProxy: false,
      enableMock: false,
      enableThread: false,
      enableHash: true,
      enableSplitChunk: true,
      enableBabel: this.isProduction,
      enableMinimize: this.isProduction,
      enableResolveCss: true,
      enableResolveAsset: true,
      enableBuildNodeLibrary: false,

      emitHtml: false,
      emitCss: this.isProduction,
      emitPublic: true,

      title: null,
      publicPath: '/',
      libraryName: false,
      postcss: 'auto',
      externals: [],
      define: {},
      skipCheckBabel: false,
      mockServer: null,
      eachPlugin: null
    }

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
    this.dependencies = Object.keys({ // 项目依赖库数组，用于判定包含什么框架
      ...this.packageJSON['devDependencies'],
      ...this.packageJSON['dependencies']
    })
    this.staticFolderPath = _options.staticFolderPath

    this.isTsProject = _options.isTsProject
    this.isEntryJSX = _options.isEntryJSX
    this.scriptExt = _options.scriptExt
    if (this.isEntryJSX === true || this.isEntryJSX === 'auto' && this.isInclude('react')) {
      this.scriptExt += 'x'
    }
    this.entryDefaultName = _options.entryDefaultName
    this.entryDefaultFileName = _options.entryDefaultFileName || `${this.entryDefaultName}${this.scriptExt}`

    this.enableFriendly = _options.enableFriendly
    this.enableProfile = _options.enableProfile
    this.enableProxy = _options.enableProxy
    this.enableMock = _options.enableMock
    this.enableThread = _options.enableThread
    this.enableHash = _options.enableHash
    this.enableSplitChunk = _options.enableSplitChunk
    this.enableBabel = _options.enableBabel
    this.enableMinimize = _options.enableMinimize
    this.enableResolveCss = _options.enableResolveCss
    this.enableResolveAsset = _options.enableResolveAsset
    this.enableBuildNodeLibrary = _options.enableBuildNodeLibrary

    this.emitCss = _options.emitCss
    this.emitHtml = _options.emitHtml
    this.emitPublic = _options.emitPublic

    this.title = _options.title || this.packageJSON['name'] || 'Webpack App'
    this.publicPath = _options.publicPath
    this.libraryName = _options.libraryName
    if (this.libraryName === true) {
      this.libraryName = this.camelCase(this.packageJSON['name']) || 'library'
    }
    this.postcss = _options.postcss
    this.externals = _options.externals
    this.define = _options.define
    this.skipCheckBabel = _options.skipCheckBabel
    this.mockServer = _options.mockServer
    this.eachPlugin = _options.eachPlugin

    this._webpack = this.require('webpack')
    this._config = {}

    if (this.isProduction) {
      this.checkEnableBabel()
    }
    if (!this.isTsProject && this.isInclude('react')) {
      this.checkEnableBabel()
    }
    if (this.enableBabel) {
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
   * @param {any[]} env
   * @param {Object} argv
   * @param {'development' | 'production'} argv.mode
   * @param {LibraryName?} libraryName
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfig}
   */
  static newLibrary(env, argv, libraryName, genCallback) {
    return new Webpack5RecommendConfig(
      env, argv,
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
      options[0].enableBuildNodeLibrary = true
      if (typeof genCallback === 'function') {
        genCallback(options)
      }
    })
  }

  /**
   * 创建Webpack5RecommendConfig
   * @param {any[]} env
   * @param {Object} argv
   * @param {'development' | 'production'} argv.mode
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfig}
   */
  static newNodeLibrary(env, argv, genCallback) {
    return new Webpack5RecommendConfig(
      env, argv,
      Webpack5RecommendConfig.genNodeOptions(genCallback)
    )
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
   * @param {any[]} env
   * @param {Object} argv
   * @param {'development' | 'production'} argv.mode
   * @param {LibraryName?} libraryName
   * @param {GenCallback?} genCallback
   * @return {Webpack5RecommendConfig}
   */
  static newReactLibrary(env, argv, libraryName, genCallback) {
    return new Webpack5RecommendConfig(
      env, argv,
      Webpack5RecommendConfig.genReactLibraryOptions(libraryName, genCallback)
    )
  }

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

    if (this.enableBuildNodeLibrary) {
      this.rebuildNodeLibrary()
    }

    if (typeof buildCallback === 'function') {
      buildCallback.call(this, this._config)
    }
    return this
  }

  buildEnd(buildCallback, debug) {
    return this.build(buildCallback).toConfig(debug)
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
    if (this.libraryName !== false) { // true会被转换成自动名称，到不了这里
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
          new (this.require('terser-webpack-plugin'))() //
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
       * 添加sass解析
       */
      if (this.isInclude('less')) {
        this._config.module.rules.push({
          test: /\.less$/,
          use: this.getCssLoader('less')
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
        'mini-css-extract-plugin',
        [
          {
            filename: this.enableHash ? '[name].style.[chunkhash:8].css' : '[name].style.css'
          }
        ]
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
      this.pushPlugin(
        'html-webpack-plugin',
        [htmWebpackPluginOptions]
      )
    }

    if (this.emitPublic && fs.existsSync(this.staticFolderPath)) {
      /**
       * 将已存在的单个文件或整个目录复制到构建目录
       * https://webpack.js.org/plugins/copy-webpack-plugin
       */
      this.pushPlugin(
        'copy-webpack-plugin',
        [
          {
            patterns: [
              {
                from: this.staticFolderPath,
                to: '.'
              }
            ]
          }
        ]
      )
    }

    if (this.enableFriendly) {
      if (this.enableProfile) {
        /**
         * Elegant ProgressBar and Profiler for Webpack 3 , 4 and 5
         * https://github.com/unjs/webpackbar
         */
        this.pushPlugin(
          'webpackbar',
          [
            {
              reporters: ['fancy', 'profile'],
              profile: true
            }
          ]
        )
      } else {
        this.pushPlugin(
          'webpackbar',
          []
        )
      }
    }

    if (this.enableFriendly && this.isStartSever) {
      this.pushPlugin(
        '@soda/friendly-errors-webpack-plugin',
        [
          {
            compilationSuccessInfo: {
              messages: [`You application is running here http://localhost:${this._config.devServer.port}`]
            }
          }
        ]
      )
    }

    if (this.isInclude('vue')) {
      /**
       * 加载vue文件必须插件
       */
      const {VueLoaderPlugin} = this.require('vue-loader')
      this.pushPlugin(
        'VueLoaderPlugin',
        VueLoaderPlugin,
        []
      )
    }

    /**
     * 允许在编译时配置全局常量
     * https://webpack.js.org/plugins/define-plugin
     */
    if (this.isInclude('vue')) {
      this.define = Object.assign({
        __VUE_OPTIONS_API__: false,
        __VUE_PROD_DEVTOOLS__: this.isDevelopment
      }, this.define)
    }
    this.pushPlugin(
      '_webpack.DefinePlugin',
      this._webpack.DefinePlugin,
      [this.define]
    )

    /**
     * 在监视模式下忽略指定的文件
     * https://webpack.js.org/plugins/watch-ignore-plugin/
     */
    if (this.isTsProject) {
      let ignorePaths = []
      // https://github.com/TypeStrong/ts-loader#usage-with-webpack-watch
      ignorePaths.push(/\.js$/, /\.d\.ts$/)
      this.pushPlugin(
        '_webpack.WatchIgnorePlugin',
        this._webpack.WatchIgnorePlugin,
        [
          {
            paths: ignorePaths
          }
        ]
      )
    }

    return this
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

  end(buildCallback, debug) {
    if (typeof buildCallback === 'function') {
      buildCallback.call(this, this._config)
    }
    return this.toConfig(debug)
  }

  camelCase(content) {
    if (!content) {
      return ''
    }
    return content.split('/').slice(-1)[0].replace(/-(\w)/g, (_, $1) => $1.toUpperCase())
  }

  /**
   * 推入配置文件插件，该方法推入的插件会触发eachPlugin
   * @param {string} name
   * @param {Function | any[]} constructor
   * @param {any[]?} args
   */
  pushPlugin(name, constructor, args) {
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

    this._config.plugins.push(new (plugin.constructor)(...plugin.args))
  }

  isInclude(libraryName) {
    return this.dependencies.includes(libraryName)
  }

  checkEnableBabel() {
    if (!this.skipCheckBabel && !this.enableBabel) {
      throw TypeError('Please start Babel in the production environment to compile.')
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
      cssRuleLoaders.push(this.require('mini-css-extract-plugin').loader)
    } else {
      cssRuleLoaders.push('style-loader')
    }

    cssRuleLoaders.push('css-loader')

    if (this.postcss === true || this.postcss === 'auto' && this.isProduction && this.isInclude('postcss-loader')) {
      cssRuleLoaders.push('postcss-loader')
    }

    switch (cssPreprocessing) {
      case 'sass':
        cssRuleLoaders.push('sass-loader')
        break
      case 'less':
        cssRuleLoaders.push('less-loader')
        break
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

  toConfig(debug) {
    if (debug) {
      console.log(this._config)
    }
    return this._config
  }
}

/**
 * WebpackConfigFactory
 * @param {{debug:boolean?,buildOptions:Webpack5RecommendConfigOptions?,buildConfigCallback:function?}?} options
 * @return {any}
 */
function wcf(options) {
  const _options = {debug: false, buildOptions: {}, buildConfigCallback: null}
  Object.assign(_options, options)
  return (env, argv) => {
    const {debug, buildOptions, buildConfigCallback} = _options
    return new Webpack5RecommendConfig(env, argv, buildOptions)
      .buildEnd(buildConfigCallback, debug)
  }
}

module.exports = {
  Webpack5RecommendConfig,
  wcf
}
