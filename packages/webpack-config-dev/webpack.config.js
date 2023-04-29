const {wcf} = require('@systemlight/webpack-config')

module.exports = wcf({
  enableDevtool: false,
  configureWebpack:{
    devServer:{
      host:'1.1.1.1'
    }
  }
})
