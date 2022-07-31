const {wcf} = require('@systemlight/webpack-config')
const WalkWebpackPlugin = require('@systemlight/walk-webpack-plugin')

module.exports = wcf({
  buildOptions: {
    enableMock: true
  },
  buildConfigCallback(config) {
    config.value = {
      devServer: {
        open: false
      },
      plugins: [
        new WalkWebpackPlugin({
          targetPath: './src/views',
          publicPath: '/',
          importPath: '@/views'
        })
      ]
    }
  }
})
