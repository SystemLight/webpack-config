const {wcf} = require('@systemlight/webpack-config')

module.exports = wcf({
  buildOptions: {
    enableMock: true
  },
  buildConfigCallback(config) {
    config.value = {
      devServer: {
        open: false
      }
    }
  }
})
