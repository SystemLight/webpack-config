import type {Configuration} from 'webpack'

import Config from 'webpack-chain'

type LibraryName = boolean | string | string[]

type ConvertRequiredType<T, TC, TR> = {
  [P in keyof T]: T[P] extends TC ? TR : T[P]
}

/**
 * - auto: 开发阶段为true
 * - !auto: 生产阶段为true
 * - ^auto: 满足依赖为true
 * - boolean: 永久为true或者false
 */
export type AutoVal = 'auto' | '!auto' | '^auto' | boolean

export interface DefaultOptions {
  cwd: string
  srcPath: string
  distPath: string
  staticFolderPath: string
  packageJSONFilePath: string

  isTsProject: boolean
  isEntryJSX: AutoVal
  scriptExt: string | null
  entryDefaultName: string
  entryDefaultFileName: string | null

  enableSSL: AutoVal
  enableDevtool: AutoVal
  enableFriendly: AutoVal
  enableProfile: AutoVal
  enableMock: AutoVal
  enableThread: AutoVal
  enableHash: AutoVal
  enableSplitChunk: AutoVal
  enableBabel: AutoVal
  enablePostcss: AutoVal
  enableMinimize: AutoVal
  enableCssModule: AutoVal
  enableResolveCss: AutoVal
  enableResolveAsset: AutoVal

  emitHtml: boolean
  emitCss: AutoVal
  emitPublic: boolean

  title: string | null
  publicPath: string
  isNodeLibrary: boolean
  libraryName: LibraryName
  externals: string[]
  define: any
  skipCheckBabel: boolean
  open: boolean
  port: number
  proxyHostAndPort: [string, number] | null

  configureWebpack: Configuration
  chainWebpack: (config: Config, context: any) => void
}

export interface Options extends ConvertRequiredType<DefaultOptions, AutoVal, boolean> {
  entryDefaultFileName: string
}

export type UserOptions = Partial<DefaultOptions>

export type Webpack5RecommendConfigOptions = UserOptions | UserOptions[]
