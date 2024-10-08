import * as path from 'node:path'
import * as fs from 'node:fs'
import {createRequire} from 'node:module'

import address from 'address'
import webpack from 'webpack'
import type {Rule, Use} from 'webpack-chain'
import Config from 'webpack-chain'
import {merge} from 'webpack-merge'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import DotenvWebpackPlugin from 'dotenv-webpack'
import WebpackBar from 'webpackbar'
import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin'
import {mockServer} from '@systemlight/webpack-config-mockserver'
import chalk from 'chalk'

import type {
  AutoVal,
  CacheGroups,
  DefaultOptions,
  ModeType,
  Options,
  SplitChunksOptions,
  Webpack5RecommendConfigOptions,
  WebpackConfiguration
} from '@/interface/Webpack5RecommendConfigOptions'
import InjectBodyWebpackPlugin from '@/plugin/inject-body-webpack-plugin'
import {getCertificate} from '@/utils/certificate'
import {getLocalIdent} from '@/utils/getCSSModuleLocalIdent'
import DefaultValue, {type DefaultValueClassOptions} from '@/utils/DefaultValue'
import logConfig from '@/utils/logConfig'
import {contains, getModuleName, getNodeModules, matchSrcExternalModuleFactory, readDir} from '@/utils'

type BuildConfigCallback = (context: {
  env: any
  argv: any
  mode: ModeType
  isStartSever: boolean
  create: (options?: Webpack5RecommendConfigOptions) => Webpack5RecommendConfig
}) => Promise<WebpackConfiguration>

export class Webpack5RecommendConfig {
  public mode: ModeType
  public devServerProtocol = 'http'
  public isProduction: boolean
  public isDevelopment: boolean
  public isStartSever: boolean
  public hasBabelConfig: boolean
  public options: Readonly<Options>

  private _webpack = webpack
  private _config = new Config()
  private readonly _isDefault: (key: string) => boolean // 判断该选项是用户配置值还是默认值
  private readonly _isExist: (filePath: string) => boolean
  private readonly _dependencies: string[] = []
  private readonly _require: NodeRequire

  /**
   * 开发必备的核心概念参考
   *
   * webpack配置项
   * https://webpack.js.org/configuration/
   *
   * 为什么不用Dll
   * https://github.com/facebook/create-react-app/pull/2710#issuecomment-378523967
   *
   * 动态引入上下文推断规则
   * https://webpack.js.org/plugins/context-replacement-plugin/
   *
   * 为什么不使用preload-webpack-plugin
   * webpack5已经支持，并且这个特性会造成重复加载，@vue/cli@5.0.0版本移除该插件引入
   * preload 是告诉浏览器页面必定需要的资源，浏览器一定会加载这些资源，
   * prefetch 是告诉浏览器页面可能需要的资源，浏览器不一定会加载这些资源
   * https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules
   * https://juejin.cn/post/7091953479857471519
   *
   * loader加载阶段执行顺序
   * pre、normal、inline以及post执行顺序
   * Pitching 阶段: loader 上的 pitch 方法，按照 后置(post)、行内(inline)、普通(normal)、前置(pre) 的顺序调用
   * Normal 阶段: loader 上的 常规方法，按照 前置(pre)、普通(normal)、行内(inline)、后置(post) 的顺序调用
   * inline loader 基本格式: 'style-loader!css-loader?modules!./styles.css'
   * https://juejin.cn/post/7037696103973650463
   * https://juejin.cn/post/7036379350710616078
   * https://juejin.cn/post/6854573204854439944#heading-5
   *
   * inline loader前缀符（https://webpack.js.org/concepts/loaders/#inline）
   * !前缀 将禁用所有已配置的 normal loader(普通 loader)
   * !!前缀 将禁用所有已配置的 loader（preLoader, loader, postLoader）
   * -!前缀 将禁用所有已配置的 preLoader 和 loader，但是不禁用 postLoaders
   * 访问举例：import Styles from 'style-loader!css-loader?modules!./styles.css';
   *
   * hash类别
   * [fullhash]: 所有文件的哈希值，一个文件变化所有使用hash的bundle都会重新输出
   * [chunkhash]: 根据不同的入口文件(Entry)进行依赖文件解析，构建对应的chunk，生成对应的哈希值
   * [contenthash]: 输出文件内容的 md4-hash，防止抽离的Css文件也随JS做重新输出
   */
  constructor(mode?: ModeType, isStartSever?: boolean, options: Webpack5RecommendConfigOptions = {}) {
    const cwd = process.cwd()
    const isTsProject = fs.existsSync(path.resolve(cwd, 'tsconfig.json'))
    const packageJSONFilePath = path.resolve(cwd, 'package.json')
    const packageJSON: object = require(packageJSONFilePath)

    this.mode = mode || 'development'
    this.isProduction = this.mode === 'production'
    this.isDevelopment = !this.isProduction // 非生产模式一律按照开发模式处理
    this.isStartSever = !!isStartSever
    this.hasBabelConfig = fs.existsSync(path.resolve(cwd, 'babel.config.js'))
    this._dependencies = Object.keys({
      // 项目依赖库数组，用于判定包含什么框架
      ...packageJSON['devDependencies'],
      ...packageJSON['dependencies']
    })
    this._require = createRequire(packageJSONFilePath)
    this._isExist = (filePath) => fs.existsSync(path.resolve(cwd, filePath))

    // 解析用户传参-->默认传参
    let defaultOptions = this._parseUserOptionsStage(options, {
      cwd: DefaultValue(() => cwd),
      srcPath: DefaultValue(() => path.resolve(cwd, 'src')),
      distPath: DefaultValue(() => path.resolve(cwd, 'dist')),
      staticFolderPath: DefaultValue(() => path.resolve(cwd, 'public')),

      isTsProject: DefaultValue(() => isTsProject),
      isEntryJSX: DefaultValue(() => '^auto'),
      scriptExt: DefaultValue((self) => {
        return (isTsProject ? 'ts' : 'js') + (DefaultValue.unpackProperty(self, 'isEntryJSX') ? 'x' : '')
      }),
      entryDefaultName: DefaultValue(() => 'main'),
      entryDefaultFileName: DefaultValue((self) => {
        return `${DefaultValue.unpackProperty(self, 'entryDefaultName')}.${DefaultValue.unpackProperty(
          self,
          'scriptExt'
        )}`
      }),

      enableSSL: DefaultValue(() => false),
      enableDevtool: DefaultValue(() => (this.mode === 'preview' ? false : '!auto')),
      enableFriendly: DefaultValue(() => true),
      enableProfile: DefaultValue(() => false),
      enableMock: DefaultValue(() => false),
      enableThread: DefaultValue(() => false),
      enableHash: DefaultValue((self) => DefaultValue.unpackProperty(self, 'isPackLibrary') === false),
      enableSplitChunk: DefaultValue((self) => {
        if (DefaultValue.unpackProperty(self, 'isPackLibrary')) {
          return false
        }
        return 'auto'
      }),
      enableBabel: DefaultValue(() => '^auto'),
      enablePostcss: DefaultValue(() => '^auto'),
      enableMinimize: DefaultValue(() => 'auto'),
      enableCssModule: DefaultValue(() => true),
      enableResolveCss: DefaultValue(() => '^auto'),
      enableResolveAsset: DefaultValue(() => true),

      emitHtml: DefaultValue((self) => {
        return !(DefaultValue.unpackProperty(self, 'isPackLibrary') || DefaultValue.unpackProperty(self, 'isNodeEnv'))
      }),
      emitCss: DefaultValue(() => false),
      emitPublic: DefaultValue(() => true),

      title: DefaultValue(() => packageJSON['name'] || 'Webpack App'),
      injectHtml: DefaultValue(() => ({content: '<div id="app"></div>', position: 'start'})),
      dotenv: DefaultValue(() => ({})),
      publicPath: DefaultValue(() => '/'),
      isNodeEnv: DefaultValue(() => false),
      isPackLibrary: DefaultValue((self) => DefaultValue.unpackProperty(self, 'libraryName') !== false),
      libraryName: DefaultValue(() => false),
      externals: DefaultValue(() => []),
      define: DefaultValue(() => ({})),
      skipCheckBabel: DefaultValue(() => false),
      open: DefaultValue(() => false),
      port: DefaultValue(() => 8080),
      proxy: DefaultValue(() => ({})),

      configureWebpack: DefaultValue(() => ({})),
      chainWebpack: DefaultValue(() => (config: any) => config)
    })

    // 解析默认传参
    this._isDefault = (key) => DefaultValue.is(defaultOptions, key)
    this.options = this._parseDefaultOptionsStage(isTsProject, packageJSON, defaultOptions)
    if (this.options.enableSSL) {
      this.devServerProtocol = 'https'
    }

    // 检测配置合理性阶段
    this._checkStage(isTsProject)
  }

  /**
   * 用户输入参数解析阶段
   * @param userOptions
   * @param defaultValueClassOptions
   */
  _parseUserOptionsStage(
    userOptions: Webpack5RecommendConfigOptions,
    defaultValueClassOptions: DefaultValueClassOptions<DefaultOptions>
  ): DefaultOptions {
    if (Array.isArray(userOptions)) {
      if (userOptions.length === 1) {
        return this._assignStage(defaultValueClassOptions, userOptions[0])
      } else if (userOptions.length === 2) {
        if (this.isProduction) {
          return this._assignStage(defaultValueClassOptions, userOptions[0]) // 生产配置
        } else {
          return this._assignStage(defaultValueClassOptions, userOptions[1]) // 开发配置
        }
      } else if (userOptions.length === 3) {
        if (this.isProduction) {
          return this._assignStage(defaultValueClassOptions, userOptions[0], userOptions[1]) // 生产配置
        } else {
          return this._assignStage(defaultValueClassOptions, userOptions[0], userOptions[2]) // 开发配置
        }
      } else {
        throw TypeError('Incorrect number of options parameters.')
      }
    } else if (typeof userOptions === 'object') {
      return this._assignStage(defaultValueClassOptions, userOptions)
    }

    throw TypeError('Incorrect number of options parameters.')
  }

  /**
   * 默认参数解析阶段
   * @param isTsProject
   * @param packageJSON
   * @param defaultOptions - 与用户属性合并过的参数配置
   */
  _parseDefaultOptionsStage(
    isTsProject: boolean,
    packageJSON: object,
    defaultOptions: DefaultOptions
  ): Readonly<Options> {
    let options: Options = DefaultValue.unpack(defaultOptions)

    if (options.libraryName === true) {
      options.libraryName = this.camelCase(packageJSON['name']) || 'library'
    }

    return Object.freeze(options)
  }

  _assignStage(target: object, ...sources: Partial<DefaultOptions>[]): DefaultOptions {
    let defaultOptions = Object.assign(target, ...sources)
    this.transformAutoVal(defaultOptions, [
      {key: 'isEntryJSX', dep: ['react']},
      {key: 'enableDevtool', dep: []},
      {key: 'enableFriendly', dep: []},
      {key: 'enableProfile', dep: []},
      {key: 'enableMock', dep: []},
      {key: 'enableThread', dep: ['thread-loader']},
      {key: 'enableHash', dep: []},
      {key: 'enableSplitChunk', dep: []},
      {key: 'enableBabel', dep: ['babel-loader', '@babel/core']},
      {key: 'enablePostcss', dep: ['postcss-loader', 'css-loader', 'style-loader']},
      {key: 'enableMinimize', dep: []},
      {key: 'enableCssModule', dep: []},
      {key: 'enableResolveCss', dep: ['css-loader', 'style-loader']},
      {key: 'enableResolveAsset', dep: []},
      {key: 'emitCss', dep: []}
    ])
    return DefaultValue.wrap<DefaultOptions>(defaultOptions)
  }

  _checkStage(isTsProject: boolean) {
    if (this.isProduction) {
      // 生产环境检查是否开启babel-loader
      this.checkEnableBabel('Please enable Babel in the production environment.')
    }
    if (!isTsProject && this.isInclude('react')) {
      // 不是ts项目时包含了react检查是否开启babel-loader
      this.checkEnableBabel('Please enable Babel to convert JSX syntax.', false)
    }
    if (this.options.enableBabel) {
      // 启用babel时检查是否需要完成react项目编译
      this.checkBabelCompileReact()
    }
  }

  build() {
    // webpack5配置文档：https://webpack.js.org/configuration/
    this.buildBasic()
    this.buildInsAndOuts()
    this.buildExternals()
    this.buildResolve()
    this.buildDevServer()
    this.buildImprove()
    this.buildRules()
    this.buildPlugins()

    return this
  }

  buildBasic() {
    let basicConfig: WebpackConfiguration = {
      mode: this.isProduction ? 'production' : 'development',
      stats: 'errors-only',
      infrastructureLogging: {
        level: 'error'
      },
      devtool: this.options.enableDevtool ? 'eval-cheap-module-source-map' : false,
      context: this.options.cwd
    }

    this._config.merge(basicConfig).when(this.isDevelopment, (config) => {
      if (this.options.isNodeEnv) {
        config.target('node')
      } else {
        config.target('web')
      }
    })
  }

  buildInsAndOuts() {
    let {
      entryDefaultName,
      srcPath,
      entryDefaultFileName,
      distPath,
      publicPath,
      enableHash,
      libraryName,
      isPackLibrary
    } = this.options

    let insAndOutsConfig: WebpackConfiguration = {
      entry: {
        [entryDefaultName]: path.resolve(srcPath, entryDefaultFileName)
      },
      output: {
        path: distPath,
        publicPath: publicPath,
        compareBeforeEmit: false, // 在打包输出文件之前，检查文件在目录中是否已经存在，如果存在就不再新写入一个相同的文件
        iife: true,
        clean: true,
        pathinfo: false // 输出结果不携带路径信息
      }
    }

    this._config
      .merge(insAndOutsConfig)
      .when(
        enableHash,
        (config) => {
          config.output.merge({
            filename: isPackLibrary ? '[name].[chunkhash:8].js' : '[name].bundle.[chunkhash:8].js', // 由配置拆分出来的文件
            chunkFilename: isPackLibrary ? '[name].[chunkhash:8].js' : '[name].chunk.[chunkhash:8].js', // 模块动态导入依赖拆分出的文件
            assetModuleFilename: 'assets/[name][hash:8][ext]' // The same as output.filename but for Asset Modules
          })
        },
        (config) => {
          config.output.merge({
            filename: isPackLibrary ? '[name].js' : '[name].bundle.js',
            chunkFilename: isPackLibrary ? '[name].js' : '[name].chunk.js',
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
            export: 'default', // 如果想导出空间中所有内容，删除掉 output.library.export 选项
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
  }

  buildExternals() {
    let externalsPresets: WebpackConfiguration['externalsPresets'] = {}
    let externals: WebpackConfiguration['externals'] = {}

    if (this.options.externals.includes('node') || this.options.isNodeEnv) {
      externalsPresets['node'] = true
    }

    if (this.options.externals.includes('react')) {
      externals['react'] = {
        root: 'React',
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react'
      }

      externals['react-dom'] = {
        root: 'ReactDOM',
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom'
      }
    }

    this._config.set('externalsPresets', externalsPresets)
    this._config.externals(externals)
  }

  buildResolve() {
    let {isTsProject, srcPath} = this.options

    let resolveOptions: WebpackConfiguration['resolve'] = {
      extensions: ['.js'],
      alias: {
        '@': srcPath
      },
      // 用于配置 npm link 是否生效，禁用可提升编译速度
      symlinks: false
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
  }

  buildDevServer() {
    let {enableMock, enableSSL, proxy} = this.options

    // https://webpack.js.org/configuration/dev-server/
    let devServerOptions = {
      host: '0.0.0.0',
      port: this.options.port,
      allowedHosts: 'all',
      magicHtml: false,
      historyApiFallback: true, // https://github.com/bripkens/connect-history-api-fallback
      liveReload: true,
      hot: false, // HMR（Hot Module Replacement），JS文件内需要调用accept()
      open: this.options.open ? [this.getUrl()] : false,
      compress: false, // Enable gzip compression for everything served
      client: {
        logging: 'error',
        overlay: {
          errors: true,
          warnings: false,
          runtimeErrors: false
        }
      },
      // https://github.com/webpack/webpack-dev-middleware
      devMiddleware: {
        stats: false
      }
    }

    this._config.devServer.merge(devServerOptions)
    this._config.devServer.set('allowedHosts', 'all')

    // https://github.com/chimurai/http-proxy-middleware
    this._config.devServer.proxy(proxy)

    if (enableMock) {
      this._config.devServer.set('setupMiddlewares', (middlewares: any, devServer: any) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined')
        }
        mockServer(devServer.app)
        return middlewares
      })
    }

    if (enableSSL) {
      // https://webpack.js.org/configuration/dev-server/#devserverserver
      // 使用 spdy 通过 HTTP/2 服务
      // 对于 Node 15.0.0 及更高版本，此选项将被忽略，因为这些版本的 spdy 已损坏
      // 一旦 Express 支持，开发服务器将迁移到 Node 的内置 HTTP/2
      let pem = getCertificate()
      this._config.devServer.set('server', {
        type: 'https',
        options: {
          key: pem,
          cert: pem
        }
      })
    }
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
       *
       * 产生bundle
       * 1. 模块是chunk
       * 2. 满足拆分条件
       */
      this._config.optimization.splitChunks(this.getDefaultSplitChunks())

      if (this.isProduction) {
        this._config.optimization.runtimeChunk('single')
      }
    }

    /**
     * optimization.providedExports 告诉webpack弄清楚哪些导出是由模块提供的，以便从…生成更高效的导出代码
     * optimization.usedExports 告诉webpack确定每个模块使用的导出
     * optimization.concatenateModules 告诉webpack找出模块图中的哪些部分可以安全地连接成一个单一模块
     *
     * optimization.moduleIds 控制模块 ID 的生成策略
     */
    this._config.optimization.minimize(enableMinimize)
    if (enableMinimize) {
      // 配置压缩不提取注释内容
      this._config.optimization
        .minimizer('TerserWebpackPlugin')
        .use(TerserWebpackPlugin, [{extractComments: false} as any])
    }
  }

  buildRules() {
    // https://webpack.js.org/configuration/module/#modulerules
    let {enableBabel, enableThread, isTsProject, enableResolveCss, enableResolveAsset, enableHash} = this.options

    // 解析选项统一配置
    this._config.module.set('parser', {
      javascript: {
        // Enable magic comments support for CommonJS, eg: const x = require(/* webpackIgnore: true */ 'x');
        commonjsMagicComments: true
      }
    })

    // js解析规则
    this._config.module
      .rule('js')
      .test(/\.js$/i)
      .exclude.add(/[\\/]node_modules[\\/]/)
      .end()
      .when(enableBabel, (config) => {
        config.use('babel-loader').loader('babel-loader').when(!this.hasBabelConfig, this.configDefaultBabelConfig)
      })
      .when(enableThread, (config) => {
        config.use('thread-loader').loader('thread-loader')
      })

    // jsx解析规则
    this._config.module.when(this.isInclude('react'), (config) => {
      config
        .rule('jsx')
        .test(/\.jsx$/i)
        .when(enableBabel, (ruleConfig) => {
          ruleConfig
            .use('babel-loader')
            .loader('babel-loader')
            .when(!this.hasBabelConfig, this.configDefaultBabelConfig)
        })
        .when(enableThread, (ruleConfig) => {
          ruleConfig.use('thread-loader').loader('thread-loader')
        })
    })

    // ts/tsx解析规则
    this._config.module.when(isTsProject, (config) => {
      config
        .rule('ts/tsx')
        .test(/\.tsx?$/i)
        .when(enableBabel, (ruleConfig) => {
          ruleConfig
            .use('babel-loader')
            .loader('babel-loader')
            .when(!this.hasBabelConfig, this.configDefaultBabelConfig)
        })
        .use('ts-loader')
        .loader('ts-loader')
        .options({
          // https://github.com/TypeStrong/ts-loader#happypackmode
          happyPackMode: enableThread,
          transpileOnly: true, // 不做类型检查，建议与 fork-ts-checker-webpack-plugin 一起使用进行完整的类型检查
          appendTsSuffixTo: this.isInclude('vue') ? [/\.vue$/] : [],
          compilerOptions: {
            jsx: !enableBabel && this.isInclude('react') ? 'react-jsxdev' : 'preserve',
            // FIXME: 永远不弹出策略修正
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
        .test(/\.vue$/i)
        .use('vue-loader')
        .loader('vue-loader')
    })

    // react解析规则
    let resolveSvg = false
    this._config.module.when(this.isInclude('react'), (config) => {
      if (this.isInclude(['file-loader', '@svgr/webpack'])) {
        config
          .rule('svg')
          .set('issuer', {
            and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
          })
          .test(/\.svg$/i)
          .use('@svgr/webpack')
          .options({
            // https://react-svgr.com/docs/options/
            prettier: false,
            svgo: false,
            titleProp: true,
            ref: true
          })
          .end()
          .use('file-loader')
          .options({
            name: enableHash ? 'images/[name].[hash:8][ext]' : 'images/[name][ext]'
          })
        resolveSvg = true
      }
    })

    if (enableResolveCss) {
      // style files regexes
      let cssRegex = /\.css$/i
      let cssModuleRegex = /\.module\.css$/i

      let sassRegex = /\.s[ca]ss$/i
      let sassModuleRegex = /\.module\.s[ca]ss$/i

      let lessRegex = /\.less$/i
      let lessModuleRegex = /\.module\.less$/i

      let stylusRegex = /\.styl(us)?$/i
      let stylusModuleRegex = /\.module\.styl(us)?$/i

      // css解析
      this.getCssLoader(
        this._config.module
          .rule('css')
          .test(cssRegex)
          .when(this.options.enableCssModule, (config) => {
            config.exclude.add(cssModuleRegex)
          })
      )
      this.options.enableCssModule &&
        this.getCssLoader(this._config.module.rule('module.css').test(cssModuleRegex), null, true)

      // sass解析
      if (this.isInclude('sass')) {
        this.getCssLoader(
          this._config.module
            .rule('sass')
            .test(sassRegex)
            .when(this.options.enableCssModule, (config) => {
              config.exclude.add(sassModuleRegex)
            }),
          'scss'
        )
        this.options.enableCssModule &&
          this.getCssLoader(this._config.module.rule('module.sass').test(sassModuleRegex), 'scss', true)
      }

      // less解析
      if (this.isInclude('less')) {
        this.getCssLoader(
          this._config.module
            .rule('less')
            .test(lessRegex)
            .when(this.options.enableCssModule, (config) => {
              config.exclude.add(lessModuleRegex)
            }),
          'less'
        )
        this.options.enableCssModule &&
          this.getCssLoader(this._config.module.rule('module.less').test(lessModuleRegex), 'less', true)
      }

      // stylus解析
      if (this.isInclude('stylus')) {
        this.getCssLoader(
          this._config.module
            .rule('stylus')
            .test(stylusRegex)
            .when(this.options.enableCssModule, (config) => {
              config.exclude.add(stylusModuleRegex)
            }),
          'stylus'
        )
        this.options.enableCssModule &&
          this.getCssLoader(this._config.module.rule('module.stylus').test(stylusModuleRegex), 'stylus', true)
      }
    }

    if (enableResolveAsset) {
      /**
       * - asset：在导出一个 data URI 和发送一个单独的文件之间自动选择
       * - asset/resource：发送一个单独的文件并导出 URL，之前通过使用 file-loader 实现
       * - asset/inline：导出一个资源的 data URI，之前通过使用 url-loader 实现
       * - asset/source：导出资源的源代码，之前通过使用 raw-loader 实现
       */

      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加图片资源解析
       */
      this._config.module
        .rule('image')
        .test(/\.(png|jpe?g|gif)$/i)
        .set('type', 'asset')
        .set('generator', {
          filename: enableHash ? 'images/[name].[hash:8][ext]' : 'images/[name][ext]'
        })

      this._config.module.when(!resolveSvg, (config) => {
        config
          .rule('svg')
          .test(/\.svg$/i)
          .set('type', 'asset')
          .set('generator', {
            filename: enableHash ? 'images/[name].[hash:8][ext]' : 'images/[name][ext]'
          })
      })

      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加媒体资源解析
       */
      this._config.module
        .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i)
        .set('type', 'asset')
        .set('generator', {
          filename: enableHash ? 'media/[name].[hash:8][ext]' : 'media/[name][ext]'
        })

      /**
       * https://webpack.js.org/guides/asset-modules/
       *
       * 添加字体资源解析
       */
      this._config.module
        .rule('font')
        .test(/\.(woff|woff2|eot|ttf|otf)$/i)
        .set('type', 'asset')
        .set('generator', {
          filename: enableHash ? 'font/[name].[hash:8][ext]' : 'font/[name][ext]'
        })
    }
  }

  buildPlugins() {
    let {
      emitCss,
      enableHash,
      emitHtml,
      injectHtml,
      title,
      emitPublic,
      staticFolderPath,
      enableFriendly,
      enableProfile,
      define,
      isTsProject,
      dotenv
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
          scriptLoading: 'defer', // blocking | defer | module 脚本加载模式
          hash: false,
          // possible meta tags
          // https://github.com/joshbuchea/HEAD
          // use: <%= htmlWebpackPlugin.tags.headTags %>
          meta: {
            charset: {charset: 'UTF-8'},
            'Content-Type': {'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8'},
            'X-UA-Compatible': {'http-equiv': 'X-UA-Compatible', content: 'IE=edge'},
            'x5-fullscreen': 'false',
            'full-screen': 'no',
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no'
          },
          // https://github.com/terser/html-minifier-terser
          minify: this.isProduction ? {removeComments: true, collapseWhitespace: true, minifyCSS: true} : false
          // src/index.ejs存在则会作为默认模板
        }
      ])

      if (injectHtml) {
        if (Array.isArray(injectHtml)) {
          injectHtml.forEach((item, index) => {
            config.plugin(`InjectBodyWebpackPlugin[${index}]`).use(InjectBodyWebpackPlugin, [item])
          })
        } else {
          config.plugin('InjectBodyWebpackPlugin[0]').use(InjectBodyWebpackPlugin, [injectHtml])
        }
      }
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
        let hostIp = address.ip()
        config.plugin('FriendlyErrorsWebpackPlugin').use(FriendlyErrorsWebpackPlugin, [
          {
            compilationSuccessInfo: {
              messages: ['App running at:', `- Local: ${this.getUrl()}`, `- Network: ${this.getUrl(hostIp)}`]
            }
          }
        ])
      })
    }

    if (this.isInclude('vue')) {
      // 配置 vueLoader
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
          __VUE_OPTIONS_API__: true,
          __VUE_PROD_DEVTOOLS__: this.isDevelopment
        },
        define
      )
    }
    this._config.plugin('_webpack.DefinePlugin').use(this._webpack.DefinePlugin, [define])

    /**
     * 加载.env环境变量配置文件
     */
    if (this._isDefault('dotenv')) {
      let count = 0
      if (this._isExist('.env')) {
        this._config.plugin(`DotenvWebpackPlugin[${count++}]`).use(DotenvWebpackPlugin, [
          {
            ...dotenv,
            path: '.env'
          }
        ])
      }

      if (this._isExist(`.env.${this.mode}`)) {
        this._config.plugin(`DotenvWebpackPlugin[${count++}]`).use(DotenvWebpackPlugin, [
          {
            ...dotenv,
            path: `.env.${this.mode}`
          }
        ])
      }
    } else {
      if (Array.isArray(dotenv)) {
        dotenv.forEach((options, index) => {
          this._config.plugin(`DotenvWebpackPlugin[${index}]`).use(DotenvWebpackPlugin, [options])
        })
      } else {
        this._config.plugin('DotenvWebpackPlugin[0]').use(DotenvWebpackPlugin, [dotenv])
      }
    }

    /**
     * 自动加载模块，而不必到处 import 或 require
     * 如果使用了eslint，需要配置 'react/react-in-jsx-scope': 'off'
     */
    let provide = {}
    if (this.isInclude('react')) {
      provide['React'] = 'react'
      // TODO: 热重载（HMR）支持 https://github.com/pmmmwh/react-refresh-webpack-plugin
    }
    this._config.plugin('_webpack.ProvidePlugin').use(this._webpack.ProvidePlugin, [provide])

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
  }

  configDefaultBabelConfig = (obj: Use) => {
    let presets: [string, any][] = [] // 预设项
    let plugins: [string, any][] = [] // 扩展插件

    let corejs = {
      version: 3,
      proposals: true
    }

    if (this.isInclude(['@babel/preset-env', 'core-js'])) {
      presets.push([
        // runtime 包含 core-js、regenerator、helper 三部分
        '@babel/env', // @babel/preset-env
        {
          debug: false,
          modules: false,
          useBuiltIns: 'usage',
          ignoreBrowserslistConfig: false,
          corejs: corejs
        }
      ])
    }

    if (this.isInclude(['@babel/plugin-transform-runtime', 'core-js'])) {
      plugins.push([
        '@babel/transform-runtime', // @babel/plugin-transform-runtime
        {
          corejs: corejs
        }
      ])
    }

    if (this.isInclude('react')) {
      // https://babeljs.io/docs/en/babel-preset-react
      presets.push(['@babel/react', {}]) // @babel/preset-react
    }

    /**
     * 不存在 babel.config.js 配置文件时创建一个默认配置
     *
     * 配置项：
     * https://babel.docschina.org/docs/en/options/
     * https://www.npmjs.com/package/babel-loader
     * https://mp.weixin.qq.com/s/JPyJ5eVC6w_e-NTMiVHzhg
     *
     * 先执行完所有 plugin，再执行 preset
     * 多个 plugin，按照声明次序顺序执行
     * 多个 preset，按照声明次序逆序执行
     *
     * 依赖项：
     * - @babel/core
     * - @babel/preset-env
     * - @babel/plugin-transform-runtime
     * - core-js
     *
     * - @babel/preset-react [react项目启用]
     */
    obj.options({
      cacheDirectory: true,
      comments: true,
      presets: presets,
      plugins: plugins
    })
  }

  configSplitChunks(buildOptions: (options: SplitChunksOptions) => void) {
    let splitChunksOptions = this.getDefaultSplitChunks()
    buildOptions(splitChunksOptions)
    this._config.optimization.splitChunks(splitChunksOptions)
  }

  getCssLoader(rule: Rule, cssPreprocessing?: 'less' | 'scss' | 'stylus' | null, modules = false) {
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
      .when(
        modules,
        (config) => {
          /**
           * https://github.com/webpack-contrib/css-loader
           * https://juejin.cn/post/6992428132263264264
           *
           * - :local 局部作用域
           * - :global 全局作用域
           */
          config.options({
            importLoaders: 0,
            modules: {
              mode: 'local',
              getLocalIdent
            }
          })
        },
        (config) => {
          config.options({
            importLoaders: 0,
            modules: {
              // 只是在标准 CSS 中额外增加了两个的伪选择器 :import 和 :export
              mode: 'icss'
            }
          })
        }
      )
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

  getDefaultSplitChunks(): SplitChunksOptions {
    return {
      /**
       * https://github.com/webpack/webpack/blob/main/lib/optimize/SplitChunksPlugin.js
       *
       * 所有的配置都是为 cacheGroups 中的项设置默认值
       * 如果重复引入不做拆分则会在不同bundle中产生重复代码打包
       *
       * chunks：
       *    - all: 所有方式引入的chunk都会计算
       *    - initial: 所有同步entry的方式引入的chunk都会进行计算
       *    - async: 所有异步的方式引入的chunk都会进行计算
       *
       * name：
       * defaultSizeTypes：与不同的大小配置限制进行合并，形成一个不同类型不同限制的对象
       * automaticNameDelimiter：指定用于生成名称的分隔符
       *
       * maxInitialRequests：入口点引入方式的最大并行请求数
       * maxAsyncRequests：异步加载时的最大并行请求数
       * minRemainingSize：拆分后chunk剩余的大小
       *
       * enforceSizeThreshold：强制执行拆分的体积阈值，如果超过了最大拆分体积，则忽略上述三个参数进行强制拆分
       *
       * minChunks：当一个module相对cacheGroups满足时，判断这个module是否被其它chunk所引用的次数大于等于该值
       * minSize：生成 chunk 的最小体积（以 bytes 为单位），为压缩之前的大小
       * maxSize：当一个 chunk 大于该值进行再次拆分
       * maxInitialSize：与maxSize相同，但是只作用于entry chunk
       * maxAsyncSize：与maxSize相同，但是只作用于async chunk
       *
       * reuseExistingChunk：
       *     - 默认false，当一个chunk中导入的module满足拆分条件时，是产生新chunk还是复用当前chunk放在其中
       *     - async chunk如果不复用会删除空chunk，entry chunk不复用会保留一个空chunk
       *
       */
      chunks: 'all',
      cacheGroups: this.getSplitChunksGroup()
    }
  }

  getSplitChunksGroup(): CacheGroups {
    // 内置定义 chunk 切割分离规则
    // 可以通过 webpack --mode development --analyze 进行代码块分析
    let cacheGroups: CacheGroups = {
      defaultVendors: {
        name: 'vendors',
        test: /[\\/]node_modules[\\/]/,
        priority: -10
      },
      default: {
        name: 'common',
        minChunks: 2,
        priority: -20
      }
    }

    // tailwindcss chunk
    if (this.isInclude('tailwindcss')) {
      Object.assign(cacheGroups, {
        tailwind: {
          name: 'tailwind',
          test: /tailwind.css$/,
          enforce: true,
          priority: 0
        }
      })
    }

    // react chunk
    if (this.isInclude('react')) {
      Object.assign(cacheGroups, {
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)/,
          enforce: true,
          priority: 0
        }
      })
    }

    // antd chunk
    if (this.isInclude('antd')) {
      cacheGroups = Object.assign(cacheGroups, {
        antd: {
          name: 'antd',
          test: /[\\/]node_modules[\\/](@ant-design|antd)/,
          enforce: true,
          priority: 0
        }
      })
    }

    // vue chunk
    if (this.isInclude('vue')) {
      Object.assign(cacheGroups, {
        vue: {
          name: 'vue',
          test: /[\\/]node_modules[\\/](@?vue|vue-router|vuex)/,
          enforce: true,
          priority: 0
        }
      })
    }

    // element-plus chunk
    if (this.isInclude('element-plus')) {
      Object.assign(cacheGroups, {
        elementUI: {
          name: 'element-plus',
          test: /[\\/]node_modules[\\/](element-plus)/,
          enforce: true,
          priority: 0
        }
      })
    }

    return cacheGroups
  }

  checkEnableBabel(msg: string, isWarn = true) {
    if (!this.options.skipCheckBabel && !this.options.enableBabel) {
      if (isWarn) {
        console.log(`${chalk.bgYellow.red('[WARN]')} - ${chalk.yellow(msg)}`)
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

  transformAutoVal(
    target: any,
    config: {
      key: string
      dep: string[]
    }[]
  ) {
    for (let item of config) {
      if (DefaultValue.is(target[item.key])) {
        let val = this.autoVal(DefaultValue.unpackProperty(target, item.key), item.dep)
        target[item.key].reset(() => val)
      } else {
        target[item.key] = this.autoVal(target[item.key], item.dep)
      }
    }
    return target
  }

  autoVal(value?: AutoVal, dependencies: string[] = []) {
    if (value === 'auto') {
      value = this.isProduction
    } else if (value === '!auto') {
      value = this.isDevelopment
    } else if (value === '^auto') {
      // 无需验证依赖，当不存在依赖时返回false即可
      return this.isInclude(dependencies)
    }
    // 启用并验证依赖，当值不是以上类型时候，用户强行启用value验证依赖不足则抛出异常
    if (value && !this.isInclude(dependencies)) {
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

  isInclude(libraryName: string | string[]) {
    if (Array.isArray(libraryName)) {
      return libraryName.every((v) => this._dependencies.includes(v))
    }
    return this._dependencies.includes(libraryName)
  }

  getUrl(host?: string, port?: number) {
    return `${this.devServerProtocol}://${host || 'localhost'}:${
      port || this.options.configureWebpack.devServer?.port || this.options.port
    }/`
  }

  toConfig(debug?: boolean) {
    this.options.chainWebpack(this._config, this)
    let emitConfig = merge(this._config.toConfig(), this.options.configureWebpack as any)
    return debug ? logConfig(emitConfig) : emitConfig
  }
}

/**
 * 注意：尽量不要在options.configureWebpack中配置mode，而是在webpack命令行中使用--mode进行指定
 * 直接指定在configureWebpack中不会影响Webpack5RecommendConfig的默认行为，只会改变webpack的默认行为
 * @param {(Webpack5RecommendConfigOptions | BuildConfigCallback)?} options - 配置选项
 * @param {boolean?} debug - 调试配置项
 */

export function wcf(
  options?: Webpack5RecommendConfigOptions,
  debug?: boolean
): (env: any, argv: any) => WebpackConfiguration
export function wcf(
  options: BuildConfigCallback,
  debug?: boolean
): (env: any, argv: any) => Promise<WebpackConfiguration>
export function wcf(
  options?: Webpack5RecommendConfigOptions | BuildConfigCallback,
  debug?: boolean
): (env: any, argv: any) => WebpackConfiguration | Promise<WebpackConfiguration> {
  let getArg = (env: any, argv: any) => {
    let mode = process.env.WCF_MODE || argv.mode || 'development'
    console.log(`当前WCF编译模式为：${chalk.blueBright(mode)}`)

    return {
      mode: mode,
      isStartSever: !!env['WEBPACK_SERVE']
    }
  }

  return (env, argv) => {
    let arg = getArg(env, argv)
    if (typeof options === 'function') {
      return options({
        env,
        argv,
        mode: arg.mode,
        isStartSever: arg.isStartSever,
        create: (buildOptions) => new Webpack5RecommendConfig(arg.mode, arg.isStartSever, buildOptions)
      })
    }

    let configBuildInstance = new Webpack5RecommendConfig(arg.mode, arg.isStartSever, options)
    configBuildInstance.build()
    return configBuildInstance.toConfig(debug)
  }
}

wcf.utils = {
  logConfig,
  contains,
  readDir,
  getNodeModules,
  getModuleName,
  matchSrcExternalModuleFactory
}
