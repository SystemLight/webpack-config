import {Compiler} from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export type InjectBodyPluginOptions = {
  content: string
  position: 'start' | 'end'
}

export default class InjectBodyPlugin {
  public static tag = '@webpack-config/InjectBodyPlugin'
  public options: InjectBodyPluginOptions

  constructor(options: Partial<InjectBodyPluginOptions>) {
    this.options = Object.assign(
      {
        content: '',
        position: 'end'
      },
      options
    )
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(InjectBodyPlugin.tag, (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(InjectBodyPlugin.tag, (options) => {
        if (this.options.position === 'end') {
          options.html = options.html.replace(/(?=<\/body>)/, this.options.content)
        } else {
          options.html = options.html.replace(/(?<=<body>)/, this.options.content)
        }
        return options
      })
    })
  }
}
