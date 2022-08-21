const {wcf} = require('@systemlight/webpack-config')

module.exports = wcf({
  enableMock: true,
  enableFriendly: true,
  open: false,
  devtool: false,
  chainWebpack(config) {
    console.log(config.devServer.get('open'))
  }
})
