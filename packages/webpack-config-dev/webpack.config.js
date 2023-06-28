const {wcf} = require('../webpack-config')

module.exports = wcf((context) => {
  return context.create().buildBasic().toConfig()
})
