const {wcf} = require('@systemlight/webpack-config')

module.exports = wcf({
  scriptExt: 'js',
  isNodeEnv: true
}, true)
