import * as path from 'path'
import * as fs from 'fs'
import {createRequire} from 'module'

import {mockServer} from '@systemlight/webpack-config-mockserver'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import WebpackBar from 'webpackbar'
import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin'
import type {Rule} from 'webpack-chain'
import Config from 'webpack-chain'
import webpack, {Configuration as WebpackConfiguration} from 'webpack'

import type {
  AutoVal,
  DefaultOptions,
  Options,
  Webpack5RecommendConfigOptions
} from './interface/Webpack5RecommendConfigOptions'

export class Webpack5RecommendConfig {
  public mode: 'development' | 'production'
  public isProduction: boolean
  public isDevelopment: boolean
  public isStartSever: boolean
  public options: Options

  private _webpack = webpack
  private _config = new Config()
  private _dependencies: string[] = []
  private readonly _require: NodeRequire

  /**
   * webpack配置项：https://webpack.js.org/configuration/
   * 为什么不用Dll：https://github.com/facebook/create-react-app/pull/2710#issuecomment-378523967
   */
  constructor(
    mode?: 'development' | 'production',
    isStartSever?: boolean,
    options: Webpack5RecommendConfigOptions = {}
  ) {
    const cwd = process.cwd()
    const isTsProject = fs.existsSync(path.resolve(cwd, 'tsconfig.json'))
    const defaultOptions: DefaultOptions = {
      cwd: cwd,
      srcPath: path.resolve(cwd, 'src'),
      distPath: path.resolve(cwd, 'dist'),
      staticFolderPath: path.resolve(cwd, 'public'),
      packageJSONFilePath: path.resolve(cwd, 'package.json'),

      isTsProject: isTsProject,
      isEntryJSX: '^auto',
      scriptExt: null,
      entryDefaultName: 'main',
      entryDefaultFileName: null,

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

      buildConfigCallback: (config) => config
    }

    this.mode = mode || 'development'
    this.isProduction = this.mode === 'production'
    this.isDevelopment = !this.isProduction
    this.isStartSever = !!isStartSever

    // 合并阶段
    if (Array.isArray(options)) {
      if (options.length === 1) {
        Object.assign(defaultOptions, options[0])
      } else if (options.length === 2) {
        if (this.isProduction) {
          Object.assign(defaultOptions, options[0]) // 生产配置
        } else {
          Object.assign(defaultOptions, options[1]) // 开发配置
        }
      } else if (options.length === 3) {
        if (this.isProduction) {
          Object.assign(defaultOptions, options[0], options[1]) // 生产配置
        } else {
          Object.assign(defaultOptions, options[0], options[2]) // 开发配置
        }
      } else {
        throw TypeError('Incorrect number of options parameters.')
      }
    } else if (typeof options === 'object') {
      Object.assign(defaultOptions, options)
    }

    // 获取包加载器和依赖相关
    const packageJSON: object = require(defaultOptions.packageJSONFilePath)
    this._dependencies = Object.keys({
      // 项目依赖库数组，用于判定包含什么框架
      ...packageJSON['devDependencies'],
      ...packageJSON['dependencies']
    })
    this._require = createRequire(defaultOptions.packageJSONFilePath)

    // 解析阶段
    defaultOptions.isEntryJSX = this.autoVal(defaultOptions.isEntryJSX, ['react'])
    const {isEntryJSX} = defaultOptions
    defaultOptions.scriptExt = defaultOptions.scriptExt || (isTsProject ? 'ts' : 'js') + (isEntryJSX ? 'x' : '')
    let {entryDefaultName, scriptExt} = defaultOptions
    defaultOptions.entryDefaultFileName = defaultOptions.entryDefaultFileName || `${entryDefaultName}.${scriptExt}`

    defaultOptions.enableFriendly = this.autoVal(defaultOptions.enableFriendly)
    defaultOptions.enableProfile = this.autoVal(defaultOptions.enableProfile)
    defaultOptions.enableProxy = this.autoVal(defaultOptions.enableProxy)
    defaultOptions.enableMock = this.autoVal(defaultOptions.enableMock)
    defaultOptions.enableThread = this.autoVal(defaultOptions.enableThread, ['thread-loader'])
    defaultOptions.enableHash = this.autoVal(defaultOptions.enableHash)
    defaultOptions.enableSplitChunk = this.autoVal(defaultOptions.enableSplitChunk)
    defaultOptions.enableBabel = this.autoVal(defaultOptions.enableBabel)
    defaultOptions.enablePostcss = this.autoVal(defaultOptions.enablePostcss, [
      'postcss-loader',
      'css-loader',
      'style-loader'
    ])
    defaultOptions.enableMinimize = this.autoVal(defaultOptions.enableMinimize)
    defaultOptions.enableResolveCss = this.autoVal(defaultOptions.enableResolveCss, ['css-loader', 'style-loader'])
    defaultOptions.enableResolveAsset = this.autoVal(defaultOptions.enableResolveAsset)

    defaultOptions.emitCss = this.autoVal(defaultOptions.emitCss)

    defaultOptions.title = defaultOptions.title || packageJSON['name'] || 'Webpack App'
    if (defaultOptions.libraryName === true) {
      defaultOptions.libraryName = this.camelCase(packageJSON['name']) || 'library'
    }

    this.options = defaultOptions as Options

    // 检测阶段
    if (this.isProduction) {
      // 生产环境检查是否开启babel-loader
      this.checkEnableBabel()
    }
    if (!isTsProject && this.isInclude('react')) {
      // 不是ts项目时包含了react检查是否开启babel-loader
      this.checkEnableBabel(false)
    }
    if (this.options.enableBabel) {
      // 启用react时检查是否需要完成react项目编译
      this.checkBabelCompileReact()
    }
  }

  build() {
    // webpack5配置文档：https://webpack.js.org/configuration/
    this.buildBasic()
      .buildInsAndOuts()
      .buildExternals()
      .buildResolve()
      .buildDevServer()
      .buildImprove()
      .buildRules()
      .buildPlugins()

    this.options.buildConfigCallback(this._config, this)

    return this
  }

  buildBasic() {
    let basicConfig: WebpackConfiguration = {
      mode: this.mode,
      stats: 'errors-only',
      infrastructureLogging: {
        level: 'error'
      },
      devtool: this.isDevelopment ? 'eval-cheap-module-source-map' : false,
      context: this.options.cwd
    }

    this._config.merge(basicConfig).when(this.isDevelopment, (config) => {
      config.target('web')
    })

    return this
  }

  buildInsAndOuts() {
    let {entryDefaultName, srcPath, entryDefaultFileName, distPath, publicPath, enableHash, libraryName} = this.options

    let insAndOutsConfig: WebpackConfiguration = {
      entry: {
        [entryDefaultName]: path.resolve(srcPath, entryDefaultFileName)
      },
      output: {
        path: distPath,
        publicPath: publicPath,
        compareBeforeEmit: false,
        iife: true,
        clean: true
      }
    }

    this._config
      .merge(insAndOutsConfig)
      .when(
        enableHash,
        (config) => {
          config.output.merge({
            filename: '[name].bundle.[chunkhash:8].js',
            chunkFilename: '[name].chunk.[chunkhash:8].js',
            assetModuleFilename: 'assets/[name][hash:8][ext]'
          })
        },
        (config) => {
          config.output.merge({
            filename: '[name].bundle.js',
            chunkFilename: '[name].chunk.js',
            assetModuleFilename: 'assets/[name][ext]'
          })
        }
      )
      .when(libraryName !== false, (config) => {
        // true会被转换成自动名称，到不了这里
        config.output.merge({
          globalObject: 'this',
          library: {
            name: libraryName, // 如果不想要名称可以设置null
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
        })
      })

    return this
  }

  buildExternals() {
    this._config.when(this.options.externals.includes('react'), (config) => {
      config.externals({
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
    })

    return this
  }

  buildResolve() {
    let {isTsProject, srcPath} = this.options

    let resolveOptions: WebpackConfiguration['resolve'] = {
      extensions: ['.js'],
      alias: {
        '@': srcPath
      }
    }

    this._config.resolve.merge(resolveOptions)

    if (isTsProject) {
      this._config.resolve.extensions.add('.ts')
    }

    if (this.isInclude('react')) {
      this._config.resolve.extensions.add('.jsx')
      if (isTsProject) {
        this._config.resolve.extensions.add('.tsx')
      }
    }

    if (this.isInclude('vue')) {
      this._config.resolve.extensions.add('.vue')
    }

    return this
  }

  buildDevServer() {
    let {enableProxy, enableMock} = this.options

    // https://webpack.js.org/configuration/dev-server/
    let port = 8080
    let devServerOptions = {
      historyApiFallback: true, // https://github.com/bripkens/connect-history-api-fallback
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

    this._config.devServer.merge(devServerOptions)
    this._config.devServer.set('allowedHosts', 'all')

    if (enableProxy) {
      this._config.devServer.proxy({
        // https://github.com/chimurai/http-proxy-middleware
        '/api': {
          target: 'http://localhost:5000/api',
          changeOrigin: true,
          secure: false
        }
      })
    }

    if (enableMock) {
      this._config.devServer.set('setupMiddlewares', (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined')
        }
        mockServer(devServer.app)
        return middlewares
      })
    }

    return this
  }

  buildImprove() {
    let {enableSplitChunk, enableMinimize} = this.options

    let performanceOptions: WebpackConfiguration['performance'] = {
      hints: 'warning',
      maxAssetSize: (this.isProduction ? 3 : 30) * 1024 * 1024,
      maxEntrypointSize: (this.isProduction ? 3 : 30) * 1024 * 1024
    }

    this._config.performance.merge(performanceOptions)

    if (enableSplitChunk) {
      /**
       * https://webpack.js.org/plugins/split-chunks-plugin/#configuration
       *
       * 产生chunk的3种方式
       * 1. 手动设置规则进行切割
       * 2. 多个入口文件会被当成多个Chunk处理
       * 3. 使用import()进行异步导入
       */
      this._config.optimization.splitChunks({
        /**
         * all: 所有方式引入的Module中的符合手动切割Chunk规则的Module都会被解析分离
         * initial: 异步引入的Module中符合手动切割Chunk规则的Module不做解析分离
         * async: 同步引入的Module中符合手动切割Chunk规则的Module不做解析分离
         */
        chunks: 'all',
        automaticNameDelimiter: '~',
        cacheGroups: this.getSplitChunksGroup()
      })

      if (this.isProduction) {
        this._config.optimization.runtimeChunk('single')
      }
    }

    if (enableMinimize) {
      this._config.optimization.merge({
        minimize: enableMinimize,
        minimizer: [
          new TerserWebpackPlugin() // 压缩器
        ]
      })
    }

    return this
  }

  buildRules() {
    let {enableBabel, enableThread, isTsProject, enableResolveCss, enableResolveAsset, enableHash} = this.options

    // js解析规则
    this._config.module
      .rule('js')
      .test(/\.js$/)
      .exclude.add(/[\\/]node_modules[\\/]/)
      .end()
      .when(enableBabel, (config) => {
        config.use('babel-loader').loader('babel-loader')
      })
      .when(enableThread, (config) => {
        config.use('thread-loader').loader('thread-loader')
      })

    // jsx解析规则
    this._config.module.when(this.isInclude('react'), (config) => {
      config
        .rule('jsx')
        .test(/\.jsx$/)
        .when(enableBabel, (ruleConfig) => {
          ruleConfig.use('babel-loader').loader('babel-loader')
        })
        .when(enableThread, (ruleConfig) => {
          ruleConfig.use('thread-loader').loader('thread-loader')
        })
    })

    // ts/tsx解析规则
    this._config.module.when(isTsProject, (config) => {
      config
        .rule('ts/tsx')
        .test(/\.tsx?$/)
        .when(enableBabel, (ruleConfig) => {
          ruleConfig.use('babel-loader').loader('babel-loader')
        })
        .use('ts-loader')
        .loader('ts-loader')
        .options({
          // https://github.com/TypeStrong/ts-loader#happypackmode
          happyPackMode: enableThread,
          transpileOnly: true,
          appendTsSuffixTo: this.isInclude('vue') ? [/\.vue$/] : [],
          compilerOptions: {
            jsx: !enableBabel && this.isInclude('react') ? 'react-jsxdev' : 'preserve',
            noEmit: true
          }
        })
        .end()
        .when(enableThread, (ruleConfig) => {
          ruleConfig.use('thread-loader').loader('thread-loader')
        })
    })

    // vue解析规则
    this._config.module.when(this.isInclude('vue'), (config) => {
      config
        .rule('vue')
        .test(/\.vue$/)
        .use('vue-loader')
        .loader('vue-loader')
    })

    if (enableResolveCss) {
      // css解析
      this.getCssLoader(this._config.module.rule('css').test(/\.css$/))

      // sass解析
      if (this.isInclude('sass')) {
        this.getCssLoader(this._config.module.rule('sass').test(/\.s[ca]ss$/), 'scss')
      }

      // less解析
      if (this.isInclude('less')) {
        this.getCssLoader(this._config.module.rule('less').test(/\.less$/), 'less')
      }

      // stylus解析
      if (this.isInclude('stylus')) {
        this.getCssLoader(this._config.module.rule('stylus').test(/\.styl(us)?$/), 'stylus')
      }
    }

    if (enableResolveAsset) {
      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加图片资源解析
       */
      this._config.module
        .rule('image')
        .test(/\.(png|jpe?g|gif|svg)$/)
        .set('type', 'asset')
        .set('generator', {
          filename: enableHash ? 'images/[name].[hash:8][ext]' : 'images/[name][ext]'
        })

      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加媒体资源解析
       */
      this._config.module
        .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .set('type', 'asset')
        .set('generator', {
          filename: enableHash ? 'media/[name].[hash:8][ext]' : 'images/[name][ext]'
        })

      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加字体资源解析
       */
      this._config.module
        .rule('font')
        .test(/\.(woff|woff2|eot|ttf|otf)$/)
        .set('type', 'asset')
        .set('generator', {
          filename: enableHash ? 'font/[name].[hash:8][ext]' : 'images/[name][ext]'
        })
    }

    return this
  }

  buildPlugins() {
    let {
      emitCss,
      enableHash,
      emitHtml,
      title,
      emitPublic,
      staticFolderPath,
      enableFriendly,
      enableProfile,
      define,
      isTsProject
    } = this.options

    /**
     * 将 CSS 提取到单独的文件中
     * https://webpack.js.org/plugins/mini-css-extract-plugin/
     */
    this._config.when(emitCss, (config) => {
      config.plugin('MiniCssExtractPlugin').use(MiniCssExtractPlugin, [
        {
          filename: enableHash ? '[name].style.[chunkhash:8].css' : '[name].style.css'
        }
      ])
    })

    /**
     * 自动添加HTML插件
     * https://github.com/jantimon/html-webpack-plugin
     */
    this._config.when(emitHtml, (config) => {
      config.plugin('HtmlWebpackPlugin').use(HtmlWebpackPlugin, [
        {
          title: title || 'app',
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
      ])
    })

    /**
     * 将已存在的单个文件或整个目录复制到构建目录
     * https://webpack.js.org/plugins/copy-webpack-plugin
     */
    this._config.when(emitPublic && fs.existsSync(staticFolderPath), (config) => {
      config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [
        {
          patterns: [
            {
              from: staticFolderPath,
              to: '.'
            }
          ]
        }
      ])
    })

    if (enableFriendly) {
      this._config.when(
        enableProfile,
        (config) => {
          /**
           * Elegant ProgressBar and Profiler for Webpack 3 , 4 and 5
           * https://github.com/unjs/webpackbar
           */
          config.plugin('WebpackBar').use(WebpackBar, [
            {
              reporters: ['fancy', 'profile'],
              profile: true
            }
          ])
        },
        (config) => {
          config.plugin('WebpackBar').use(WebpackBar)
        }
      )

      this._config.when(this.isStartSever, (config) => {
        config.plugin('FriendlyErrorsWebpackPlugin').use(FriendlyErrorsWebpackPlugin, [
          {
            compilationSuccessInfo: {
              messages: [`You application is running here http://localhost:${this._config.devServer.get('port')}`]
            }
          }
        ])
      })
    }

    if (this.isInclude('vue')) {
      const {VueLoaderPlugin} = this._require('vue-loader')
      this._config.plugin('VueLoaderPlugin').use(VueLoaderPlugin)
    }

    /**
     * 允许在编译时配置全局常量
     * https://webpack.js.org/plugins/define-plugin
     */
    if (this.isInclude('vue')) {
      // https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
      define = Object.assign(
        {
          __VUE_OPTIONS_API__: false,
          __VUE_PROD_DEVTOOLS__: this.isDevelopment
        },
        define
      )
    }
    this._config.plugin('_webpack.DefinePlugin').use(this._webpack.DefinePlugin, [define])

    /**
     * 在监视模式下忽略指定的文件
     * https://webpack.js.org/plugins/watch-ignore-plugin/
     */
    if (isTsProject) {
      let ignorePaths: RegExp[] = []
      // https://github.com/TypeStrong/ts-loader#usage-with-webpack-watch
      ignorePaths.push(/\.js$/, /\.d\.ts$/)
      this._config.plugin('_webpack.WatchIgnorePlugin').use(this._webpack.WatchIgnorePlugin, [{paths: ignorePaths}])
    }

    return this
  }

  getCssLoader(rule: Rule, cssPreprocessing?: 'less' | 'scss' | 'stylus') {
    let {emitCss, enablePostcss} = this.options

    rule
      .when(
        emitCss,
        (config) => {
          config.use('MiniCssExtractPlugin.loader').loader(MiniCssExtractPlugin.loader)
        },
        (config) => {
          config.use('style-loader').loader('style-loader')
        }
      )
      .use('css-loader')
      .loader('css-loader')
      .end()
      .when(enablePostcss, (config) => {
        config.use('postcss-loader').loader('postcss-loader')
      })

    switch (cssPreprocessing) {
      case 'scss':
        rule.use('sass-loader').loader('sass-loader')
        break
      case 'less':
        rule.use('less-loader').loader('less-loader')
        break
      case 'stylus':
        rule.use('stylus-loader').loader('stylus-loader')
    }

    return rule
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

  checkEnableBabel(isWarn = true) {
    if (!this.options.skipCheckBabel && !this.options.enableBabel) {
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

  autoVal(value?: AutoVal, dependencies: string[] = []) {
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

  camelCase(content: string): string {
    if (!content) {
      return ''
    }
    return content
      .split('/')
      .slice(-1)[0]
      .replace(/-(\w)/g, (_, $1) => $1.toUpperCase())
  }

  isInclude(libraryName) {
    return this._dependencies.includes(libraryName)
  }

  toConfig() {
    return this._config.toConfig()
  }

  toString() {
    return this._config.toString()
  }
}

export function wcf(options: Webpack5RecommendConfigOptions) {
  return (env, argv) => {
    const mode = argv.mode || 'development'
    const isStartSever = !!env['WEBPACK_SERVE']
    return new Webpack5RecommendConfig(mode, isStartSever, options).build().toConfig()
  }
}
