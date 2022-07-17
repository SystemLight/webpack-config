const mockServer = require('./server')
const mockXHR = require('./xhr')
const {param2Obj, deepClone} = require('./utils')

module.exports = {
  mockServer,
  mockXHR,
  param2Obj,
  deepClone
}
