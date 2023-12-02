const {wcf} = require('../webpack-config')

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve()
    }, ms)
  })
}

module.exports = wcf({})
