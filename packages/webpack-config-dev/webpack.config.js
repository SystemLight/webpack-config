const {wcf} = require('@systemlight/webpack-config')
const {AutoRouteWebpackPlugin, vueRoutesRender} = require('@systemlight/auto-route-webpack-plugin')

module.exports = wcf({
  enableMock: true,
  enableFriendly: true,
  buildConfigCallback(config) {
    config.devServer.open(false)
    config.plugin('AutoRouteWebpackPlugin')
      .use(AutoRouteWebpackPlugin, [
        {
          targetPath: './src/views',
          importPath: '@/views',
          loaderTest: /routes\/index\.js$/,
          routesRender: vueRoutesRender
        }
      ])
  }
})
