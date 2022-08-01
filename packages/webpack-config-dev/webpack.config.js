const {wcf} = require('@systemlight/webpack-config')
const AutoRouteWebpackPlugin = require('@systemlight/auto-route-webpack-plugin')

module.exports = wcf({
  buildOptions: {
    enableMock: true,
    emitHtml: true,
    enableFriendly: false
  },
  buildConfigCallback(config) {
    config.value = {
      devServer: {
        open: false
      },
      module: {
        rules: [
          {
            test: /routes\/index\.js$/,
            exclude: /node_modules/,
            use: [AutoRouteWebpackPlugin.loader]
          }
        ]
      },
      plugins: [
        new AutoRouteWebpackPlugin({
          targetPath: './src/views',
          importPath: '@/views',
          routePresetType: 'vue'
        })
      ]
    }
  }
})
