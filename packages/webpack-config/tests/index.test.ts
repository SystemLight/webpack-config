import * as path from 'node:path'

import {wcf, Webpack5RecommendConfig} from '@/index'

let contextFactory =
  (env = {WEBPACK_SERVE: false}, argv = {mode: 'production'}) =>
  (configCallback: ReturnType<typeof wcf>) =>
    configCallback(env, argv)

let hasHashFileOut = {
  filename: '[name].bundle.[chunkhash:8].js',
  chunkFilename: '[name].chunk.[chunkhash:8].js',
  assetModuleFilename: 'assets/[name][hash:8][ext]'
}

let noHashFileOut = {
  filename: '[name].bundle.js',
  chunkFilename: '[name].chunk.js',
  assetModuleFilename: 'assets/[name][ext]'
}

let originalLog: any
let originalWarn: any
let originalError: any

function expectWcfCommon(config) {
  expect(config.stats).toBe('errors-only')
  expect(config.infrastructureLogging).toEqual({level: 'error'})
  expect(config.context).toBe(process.cwd())
  expect(config.cache).toEqual({type: 'filesystem'})
  expect(config.entry).toEqual({
    main: [path.resolve(process.cwd(), 'src/main.ts')]
  })
  expect(config.resolve).toEqual({
    symlinks: false,
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    },
    extensions: ['.js', '.ts']
  })
  expect(config.devServer).toEqual({
    allowedHosts: 'all',
    historyApiFallback: true,
    host: '0.0.0.0',
    liveReload: true,
    hot: false,
    open: false,
    port: 8080,
    magicHtml: false,
    client: {logging: 'error'},
    devMiddleware: {stats: false}
  })
  expect(config.optimization).toBeTruthy()
  expect(config.module).toBeTruthy()
  expect(config.plugins).toBeTruthy()
}

beforeAll(() => {
  originalLog = global.console.log
  originalWarn = global.console.warn
  originalError = global.console.error
  global.console.log = jest.fn()
  global.console.warn = jest.fn()
  global.console.error = jest.fn()
})

afterAll(() => {
  global.console.log = originalLog
  global.console.warn = originalWarn
  global.console.error = originalError
})

describe('Webpack5RecommendConfig', () => {
  let commonOutputOptions = {
    path: path.resolve(process.cwd(), 'dist'),
    publicPath: '/',
    compareBeforeEmit: false,
    iife: true,
    clean: true,
    pathinfo: false,
    ...hasHashFileOut
  }

  test('生产模式 - 常规', () => {
    let defaultContext = contextFactory()
    let defaultWebpackConfig = defaultContext(wcf({}))

    expect(defaultWebpackConfig.mode).toBe('production')
    expect(defaultWebpackConfig.devtool).toBe(false)
    expect(defaultWebpackConfig.output).toEqual(commonOutputOptions)
    expect(defaultWebpackConfig.performance).toEqual({
      hints: 'warning',
      maxAssetSize: 3 * 1024 * 1024,
      maxEntrypointSize: 3 * 1024 * 1024
    })
    expectWcfCommon(defaultWebpackConfig)
  })

  test('开发模式 - 常规', () => {
    let defaultContext = contextFactory({WEBPACK_SERVE: false}, {mode: 'development'})
    let defaultWebpackConfig = defaultContext(wcf({}))

    expect(defaultWebpackConfig.mode).toBe('development')
    expect(defaultWebpackConfig.devtool).toBe('eval-cheap-module-source-map')
    expect(defaultWebpackConfig.output).toEqual(commonOutputOptions)
    expect(defaultWebpackConfig.performance).toEqual({
      hints: 'warning',
      maxAssetSize: 30 * 1024 * 1024,
      maxEntrypointSize: 30 * 1024 * 1024
    })
    expectWcfCommon(defaultWebpackConfig)
  })

  test('生产模式 - 文件hash配置', () => {
    let defaultContext = contextFactory()
    let defaultWebpackConfig = defaultContext(
      wcf({
        enableHash: false
      })
    )

    expect(defaultWebpackConfig.mode).toBe('production')
    expect(defaultWebpackConfig.devtool).toBe(false)
    expect(defaultWebpackConfig.output).toEqual({
      ...commonOutputOptions,
      ...noHashFileOut
    })
    expect(defaultWebpackConfig.performance).toEqual({
      hints: 'warning',
      maxAssetSize: 3 * 1024 * 1024,
      maxEntrypointSize: 3 * 1024 * 1024
    })
    expectWcfCommon(defaultWebpackConfig)
  })

  test('生产模式 - node环境开发库', () => {
    let defaultContext = contextFactory({WEBPACK_SERVE: false}, {mode: 'production'})
    let defaultWebpackConfig = defaultContext(
      wcf({
        isNodeEnv: true,
        libraryName: true
      })
    )

    expect(defaultWebpackConfig.mode).toBe('production')
    expect(defaultWebpackConfig.devtool).toBe(false)
    expect(defaultWebpackConfig.output).toEqual({
      ...commonOutputOptions,
      globalObject: 'this',
      library: {
        name: 'webpackConfig',
        type: 'umd2',
        umdNamedDefine: true,
        export: 'default',
        auxiliaryComment: {
          amd: 'AMD Export',
          commonjs: 'CommonJS Export',
          commonjs2: 'CommonJS2 Export',
          root: 'Root Export'
        }
      }
    })
    expect(defaultWebpackConfig.performance).toEqual({
      hints: 'warning',
      maxAssetSize: 3 * 1024 * 1024,
      maxEntrypointSize: 3 * 1024 * 1024
    })
    expectWcfCommon(defaultWebpackConfig)
  })

  test('开发模式 - node环境开发库', () => {
    let defaultContext = contextFactory({WEBPACK_SERVE: false}, {mode: 'development'})
    let defaultWebpackConfig = defaultContext(
      wcf({
        isNodeEnv: true,
        libraryName: true
      })
    )

    expect(defaultWebpackConfig.mode).toBe('development')
    expect(defaultWebpackConfig.devtool).toBe('eval-cheap-module-source-map')
    expect(defaultWebpackConfig.output).toEqual({
      ...commonOutputOptions,
      globalObject: 'this',
      library: {
        name: 'webpackConfig',
        type: 'umd2',
        umdNamedDefine: true,
        export: 'default',
        auxiliaryComment: {
          amd: 'AMD Export',
          commonjs: 'CommonJS Export',
          commonjs2: 'CommonJS2 Export',
          root: 'Root Export'
        }
      }
    })
    expect(defaultWebpackConfig.performance).toEqual({
      hints: 'warning',
      maxAssetSize: 30 * 1024 * 1024,
      maxEntrypointSize: 30 * 1024 * 1024
    })
    expectWcfCommon(defaultWebpackConfig)
  })

  test('开发库 - 原始对象', () => {
    let nodeProLibraryConfig = new Webpack5RecommendConfig('production', false, {
      isNodeEnv: true,
      libraryName: true
    })
    expect(nodeProLibraryConfig.options.emitHtml).toBeFalsy()
    expect(nodeProLibraryConfig.options.enableSplitChunk).toBeFalsy()

    let nodeAppDevConfig = new Webpack5RecommendConfig('development', false, {
      isNodeEnv: true,
      libraryName: false
    })
    expect(nodeAppDevConfig.options.emitHtml).toBeFalsy()
    expect(nodeAppDevConfig.options.enableSplitChunk).toBeFalsy()

    let nodeAppProConfig = new Webpack5RecommendConfig('production', false, {
      isNodeEnv: true,
      libraryName: false
    })
    expect(nodeAppProConfig.options.emitHtml).toBeFalsy()
    expect(nodeAppProConfig.options.enableSplitChunk).toBeTruthy()

    let webAppDevConfig = new Webpack5RecommendConfig('development', false, {})
    expect(webAppDevConfig.options.emitHtml).toBeTruthy()
    expect(webAppDevConfig.options.enableSplitChunk).toBeFalsy()

    let webAppProConfig = new Webpack5RecommendConfig('production', false, {})
    expect(webAppProConfig.options.emitHtml).toBeTruthy()
    expect(webAppProConfig.options.enableSplitChunk).toBeTruthy()
  })
})