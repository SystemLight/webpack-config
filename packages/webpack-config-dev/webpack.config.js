const {wcf} = require('@systemlight/webpack-config')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

module.exports = wcf({
  enableDevtool: false,
  configureWebpack: {
    plugins: [
      new AddAssetHtmlPlugin({
        filepath: require.resolve('jquery')
      })
    ]
  },
  chainWebpack(config) {
    config.plugin('HtmlWebpackPlugin').tap((args) => {
      args[0].scriptLoading = 'blocking'
      return args
    })
  }
}, false)
