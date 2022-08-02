const {wcf} = require('@systemlight/webpack-config')
const {AutoRouteWebpackPlugin, vueRoutesRender} = require('@systemlight/auto-route-webpack-plugin')

module.exports = wcf({
  buildOptions: {
    enableMock: true,
    emitHtml: true,
    enableFriendly: true
  },
  buildConfigCallback(config) {
    config.value = {
      devServer: {
        open: false
      },
      plugins: [
        new AutoRouteWebpackPlugin({
          targetPath: './src/views',
          importPath: '@/views',
          loaderTest: /routes\/index\.js$/,
          routesRender: vueRoutesRender
        })
      ]
    }
  }
})
