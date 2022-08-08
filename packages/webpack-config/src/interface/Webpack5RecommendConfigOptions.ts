import Config from 'webpack-chain'

type LibraryName = boolean | string | string[]

export type Dictionary = {
  [key: string]: any
}

type ConvertRequiredType<T, TC, TR> = {
  [P in keyof T]: T[P] extends TC ? TR : T[P]
}

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

  enableFriendly: AutoVal
  enableProfile: AutoVal
  enableProxy: AutoVal
  enableMock: AutoVal
  enableThread: AutoVal
  enableHash: AutoVal
  enableSplitChunk: AutoVal
  enableBabel: AutoVal
  enablePostcss: AutoVal
  enableMinimize: AutoVal
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
  define: Dictionary
  skipCheckBabel: boolean

  buildConfigCallback: (config: Config, context: any) => void
}

export interface Options extends ConvertRequiredType<DefaultOptions, AutoVal, boolean> {
  entryDefaultFileName: string
}

export type UserOptions = Partial<DefaultOptions>

export type Webpack5RecommendConfigOptions = UserOptions | UserOptions[]
