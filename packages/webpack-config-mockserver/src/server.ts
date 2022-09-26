import * as path from 'path'

import chokidar from 'chokidar'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import Mock from 'mockjs'
import type {Application} from 'express'

const mockDir = path.resolve(process.cwd(), 'mock')

function registerRoutes(app: Application) {
  let mockLastIndex
  // 读取运行目录下的mock/index.js文件载入mock配置项
  const mocks = require(path.resolve(mockDir, 'index.js'))
  const mocksForServer = mocks.map((route) => {
    return responseFake(route.url, route.type, route.response)
  })
  for (const mock of mocksForServer) {
    app[mock.type](mock.url, mock.response)
    mockLastIndex = app._router.stack.length
  }
  const mockRoutesLength = Object.keys(mocksForServer).length
  return {
    mockRoutesLength,
    mockStartIndex: mockLastIndex - mockRoutesLength
  }
}

function unregisterRoutes() {
  Object.keys(require.cache).forEach((i) => {
    if (i.includes(mockDir)) {
      delete require.cache[require.resolve(i)]
    }
  })
}

function responseFake(url, type, respond) {
  // for mock server
  return {
    url: new RegExp(url),
    type: type || 'get',
    response(req, res) {
      console.log('request invoke: ' + chalk.redBright(req.path))
      res.json(Mock.mock(respond instanceof Function ? respond(req, res) : respond))
    }
  }
}

function middleware(app: Application) {
  // parse app.body
  // https://expressjs.com/en/4x/api.html#req.body
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )

  let mockRoutes = registerRoutes(app)
  let mockRoutesLength = mockRoutes.mockRoutesLength
  let mockStartIndex = mockRoutes.mockStartIndex

  // watch files, hot reload mock server
  chokidar
    .watch(mockDir, {
      ignored: /mock-server/,
      ignoreInitial: true
    })
    .on('all', (event, path) => {
      if (event === 'change' || event === 'add') {
        try {
          // remove mock routes stack
          app._router.stack.splice(mockStartIndex, mockRoutesLength)

          // clear routes cache
          unregisterRoutes()

          mockRoutes = registerRoutes(app)
          mockRoutesLength = mockRoutes.mockRoutesLength
          mockStartIndex = mockRoutes.mockStartIndex

          console.log(chalk.magentaBright(`\n > Mock Server hot reload success! changed  ${path}`))
        } catch (error) {
          console.log(chalk.redBright(error))
        }
      }
    })
}

export default middleware
