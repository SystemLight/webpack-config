import type {optimize, WebpackOptionsNormalized} from 'webpack'
import Config from 'webpack-chain'

import type {InjectBodyPluginOptions} from '@/plugin/inject-body-webpack-plugin'

export type LibraryName = boolean | string | string[]

export interface Dict {
  [key: string]: any
}

export type ConvertRequiredType<T, TC, TR> = {
  [P in keyof T]: T[P] extends TC ? TR : T[P]
}

export interface DotEnvOptions {
  path?: string
  safe?: boolean
  allowEmptyValues?: boolean
  systemvars?: boolean
  silent?: boolean
  expand?: boolean
  defaults?: boolean
  ignoreStub?: boolean
  prefix?: string
}

/**
 * - auto: 生产模式为 true，非生产模式为 false
 * - !auto: 非生产模式为 true，生产模式为 false
 * - ^auto: 依赖项已经安装的时候为 true，不同选项依赖的库不一样
 * - boolean: 指定永久为 true/false
 */
export type AutoVal = 'auto' | '!auto' | '^auto' | boolean

export type SplitChunksOptions = NonNullable<ConstructorParameters<typeof optimize.SplitChunksPlugin>[0]>
export type CacheGroups = SplitChunksOptions['cacheGroups']
export type WebpackConfiguration = {
  amd?: WebpackOptionsNormalized['amd']
  bail?: WebpackOptionsNormalized['bail']
  cache?: WebpackOptionsNormalized['cache']
  context?: WebpackOptionsNormalized['context']
  dependencies?: WebpackOptionsNormalized['dependencies']
  devServer?: WebpackOptionsNormalized['devServer']
  devtool?: WebpackOptionsNormalized['devtool']
  entry?: {[index: string]: any}
  experiments?: WebpackOptionsNormalized['experiments']
  externals?: WebpackOptionsNormalized['externals']
  externalsPresets?: WebpackOptionsNormalized['externalsPresets']
  externalsType?: WebpackOptionsNormalized['externalsType']
  ignoreWarnings?: WebpackOptionsNormalized['ignoreWarnings']
  infrastructureLogging?: WebpackOptionsNormalized['infrastructureLogging']
  loader?: WebpackOptionsNormalized['loader']
  mode?: WebpackOptionsNormalized['mode']
  module?: WebpackOptionsNormalized['module']
  name?: WebpackOptionsNormalized['name']
  node?: WebpackOptionsNormalized['node']
  optimization?: WebpackOptionsNormalized['optimization']
  output?: WebpackOptionsNormalized['output']
  parallelism?: WebpackOptionsNormalized['parallelism']
  performance?: WebpackOptionsNormalized['performance']
  plugins?: WebpackOptionsNormalized['plugins']
  profile?: WebpackOptionsNormalized['profile']
  recordsInputPath?: WebpackOptionsNormalized['recordsInputPath']
  recordsOutputPath?: WebpackOptionsNormalized['recordsOutputPath']
  resolve?: WebpackOptionsNormalized['resolve']
  resolveLoader?: WebpackOptionsNormalized['resolveLoader']
  snapshot?: WebpackOptionsNormalized['snapshot']
  stats?: WebpackOptionsNormalized['stats']
  target?: WebpackOptionsNormalized['target']
  watch?: WebpackOptionsNormalized['watch']
  watchOptions?: WebpackOptionsNormalized['watchOptions']
}

// wcf options - 所有配置项都是智能检测环境生成默认值，无特殊要求不需要配置
export interface DefaultOptions {
  cwd: string // 当前运行webpack所在位置
  srcPath: string // 源码目录文件位置
  distPath: string // 输出文件位置
  staticFolderPath: string // 静态文件public目录

  isTsProject: boolean // 是否为TS项目
  isEntryJSX: AutoVal // 定义入口文件是否是JSX或者TSX
  scriptExt: string | null // 入口脚本扩展名称，js/jsx/ts/tsx...
  entryDefaultName: string // 入口默认名，webpack默认入口为index.js，输出为main.js
  entryDefaultFileName: string | null // 入口文件默认名称

  enableSSL: AutoVal // 是否启用SSL证书服务
  enableDevtool: AutoVal // 是否开启使用eval-cheap-module-source-map做文件映射
  enableFriendly: AutoVal // 否启用更加友好的开发环境，进度条、错误提示等
  enableProfile: AutoVal // 是否统计并打印webpack打包详细信息
  enableMock: AutoVal // 是否mock数据代理配置
  enableThread: AutoVal // 是否启用多线程
  enableHash: AutoVal // 是否启用hash
  enableSplitChunk: AutoVal // 是否启用代码chunk切分
  enableBabel: AutoVal // 是否启用babel编译
  enablePostcss: AutoVal // 是否启用postcss
  enableMinimize: AutoVal // 是否启用代码压缩
  enableCssModule: AutoVal // 是否启用css module
  enableResolveCss: AutoVal // 是否解析样式表，css/less/sass/styl
  enableResolveAsset: AutoVal // 是否解析资源文件，图片/字体/音视频

  emitHtml: boolean // 是否弹出html
  emitCss: AutoVal // 是否弹出css
  emitPublic: boolean // 是否复制public文件

  title: string | null // 弹出html文件title标签内容
  injectHtml: InjectBodyPluginOptions | InjectBodyPluginOptions[] // 注入到html中的内容项
  dotenv: DotEnvOptions | DotEnvOptions[]
  publicPath: string // public文件路径
  isNodeEnv: boolean // 是否是node库
  isPackLibrary: boolean // 是否作为库函数打包
  libraryName: LibraryName // 作为库函数包默认配置
  externals: string[] // webpack externals
  define: any // 定义可以在输出目标文件访问的环境变量
  skipCheckBabel: boolean // 是否强制跳过babel启用情况检测，当你真正确认自己不需要babel时，可以跳过警告
  open: boolean // 开发服务器是否直接打开浏览器
  port: number // 开发服务器端口号
  proxyHostAndPort: [string, number] | null // 代理地址和端口号，默认转发路径为 /api

  configureWebpack: WebpackConfiguration // webpack config
  chainWebpack: (config: Config, context: any) => void // webpack chain config
}

export interface Options extends ConvertRequiredType<DefaultOptions, AutoVal, boolean> {
  entryDefaultFileName: string
}

export type UserOptions = Partial<DefaultOptions>

export type Webpack5RecommendConfigOptions = UserOptions | UserOptions[]
