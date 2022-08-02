const fs = require('fs')
const path = require('path')

const {customAlphabet} = require('nanoid')
const {validate} = require('schema-utils')
const stringifyObject = require('stringify-object')

const {NS} = require('./constant')
const vueRoutesRender = require('./vue-routes-render')
const schema = require('./schema.json')

const nanoid = customAlphabet('1234567890abcdef', 10)

/**
 * 基础路由标准
 * @typedef Routes
 * @property {String} name
 * @property {Boolean} exact
 * @property {String} path
 * @property {String} component
 * @property {Routes[]?} routes
 */

class FileInfo {
  static _dynamicRouteMatchG = /\[((.*?)\$?)]/g
  static _dynamicRouteMatch = /\[((.*?)\$?)]/

  constructor(fullPath) {
    let _filename = path.basename(fullPath)

    this.id = nanoid()
    this.parent = null
    this.layout = null
    this.name = _filename.split('.')[0]
    this.nameWithExt = _filename
    this.fullPath = fullPath
    this.isDirectory = fs.statSync(fullPath).isDirectory()
  }

  static getSafePathStr(str) {
    if (str.endsWith('/')) {
      return str.substring(0, str.length - 1)
    }

    return str
  }

  getParentPath() {
    let parentCollect = []
    let currentParent = this.parent

    while (currentParent.parent) {
      parentCollect.push(currentParent.name)
      currentParent = currentParent.parent
    }

    return parentCollect.reverse().join('/')
  }

  getUrlPath(publicPath, parentPath) {
    let urlPathArray = [FileInfo.getSafePathStr(publicPath)]

    let _parentPath = parentPath || this.getParentPath()

    if (_parentPath) {
      urlPathArray.push(_parentPath)
    }

    // 不计入index名称文件到访问路由路径中
    if (this.name !== 'index') {
      urlPathArray.push(this.name)
    }

    let urlPath = urlPathArray.join('/')
    urlPath = urlPath ? urlPath : publicPath

    // 替换生成可选路由路径
    let matcher = urlPath.match(FileInfo._dynamicRouteMatch)
    if (matcher) {
      if (matcher[1].endsWith('$')) {
        urlPath = urlPath.replace(FileInfo._dynamicRouteMatchG, ':$2?')
      } else {
        urlPath = urlPath.replace(FileInfo._dynamicRouteMatchG, ':$2')
      }
    }

    // 去除_layout开头文件名称计入路由路径中
    return urlPath.replace(/\/_layout$/, '')
  }

  getImportPath(importPath, parentPath) {
    let importPathArray = [FileInfo.getSafePathStr(importPath)]

    let _parentPath = parentPath || this.getParentPath()

    if (_parentPath) {
      importPathArray.push(_parentPath)
    }

    importPathArray.push(this.nameWithExt)

    return importPathArray.join('/')
  }

  getChildren() {
    return fs.readdirSync(this.fullPath)
  }
}

class AutoRoute {
  constructor(options) {
    let {
      targetPath,
      importPath,
      publicPath = '/',
      ignores = [],
      ignoreFiles = [],
      ignoreFolders = [],
      routesRender = null
    } = options

    // 正则可视化：https://tooltt.com/regulex/
    let defaultIgnores = [
      /^[._]/ // 以 . 或 _ 开头的文件或目录
    ]
    let defaultIgnoreFiles = [
      /d\.ts$/, // 以 d.ts 结尾的类型定义文件
      /(test)|(spec)|(e2e)/, // 以 test.ts、spec.ts、e2e.ts 结尾的测试文件（适用于 .js、.jsx 和 .tsx 文件）
      /^((?!(\.([jt]sx?)|(\.vue))$).)*$/ // 不是 .vue .js、.jsx、.ts 或 .tsx 文件
    ]
    let defaultIgnoreFolders = [
      /^components?$/, // components 和 component 目录
      /^utils?$/ // utils 和 util 目录
    ]

    this.targetPath = path.resolve(targetPath)
    this.importPath = importPath
    this.publicPath = publicPath
    this.ignoreFiles = [...[...defaultIgnores, ...ignores], ...[...defaultIgnoreFiles, ...ignoreFiles]]
    this.ignoreFolders = [...[...defaultIgnores, ...ignores], ...[...defaultIgnoreFolders, ...ignoreFolders]]

    this._layout = '_layout'
    this._childrenName = 'routes'
    this._routesRender = routesRender || ((routes) => stringifyObject(routes, {indent: '  '}))
  }

  getFileInfos() {
    let inputInfos = [new FileInfo(this.targetPath)]
    let outputInfos = []

    while (inputInfos.length > 0) {
      let currentInfo = inputInfos.pop()
      if (currentInfo.isDirectory) {
        // 如果文件夹名称符合则忽略
        if (this.ignoreFolders.some((v) => v.test(currentInfo.name))) {
          continue
        }

        // 子级集成父级layout属性
        let layoutInfo = currentInfo.layout

        //  获取目录下所有文件名称
        let children = currentInfo.getChildren()
        let layoutChildrenFileName = children.find((v) => v.startsWith(this._layout))
        if (layoutChildrenFileName) {
          // 目录下存在_layout开头的文件
          let layoutChildrenFullPath = path.resolve(currentInfo.fullPath, layoutChildrenFileName)
          if (fs.statSync(layoutChildrenFullPath).isFile()) {
            // 创建一个新的layout对象
            let _layoutInfo = new FileInfo(layoutChildrenFullPath)
            _layoutInfo.parent = currentInfo
            _layoutInfo.layout = layoutInfo

            // 更新layout
            layoutInfo = _layoutInfo

            // 排除layout
            children = children.filter((v) => v !== _layoutInfo.nameWithExt)
          }
        }

        inputInfos = inputInfos.concat(
          children.map((v) => {
            let _cFileInfo = new FileInfo(path.resolve(currentInfo.fullPath, v))
            _cFileInfo.parent = currentInfo
            _cFileInfo.layout = layoutInfo
            return _cFileInfo
          })
        )
      } else {
        // 如果文件名称符合则忽略
        if (this.ignoreFolders.some((v) => v.test(currentInfo.name))) {
          continue
        }

        outputInfos.push(currentInfo)
      }
    }

    return outputInfos
  }

  getUrl(info, parentPath) {
    return info.getUrlPath(this.publicPath, parentPath)
  }

  getImport(info, parentPath) {
    return info.getImportPath(this.importPath, parentPath)
  }

  /**
   * 生成一级路由
   * @param {FileInfo} info
   * @param {Boolean} exact
   */
  getFirstLevelRoute(info, exact = true) {
    let name = info.name + '-' + info.id
    if (info.name === 'index' || info.name === '_layout') {
      name = info.parent.name + '-' + name
    }
    let parentPath = info.getParentPath()
    return {
      name: name,
      exact: exact,
      path: this.getUrl(info, parentPath),
      component: this.getImport(info, parentPath),
      [this._childrenName]: []
    }
  }

  /**
   * 生成标准路由
   * @param {FileInfo[]} infos
   */
  genRoutes(infos) {
    let routes = []
    let cacheRoute = {}
    let that = this

    function getCacheRoute(layoutInfo) {
      // 是否缓存了layout
      const {id} = layoutInfo
      if (!cacheRoute[id]) {
        cacheRoute[id] = that.getFirstLevelRoute(layoutInfo, false)
      }
      return cacheRoute[id]
    }

    for (let info of infos) {
      if (info.layout) {
        let current = info
        let route = this.getFirstLevelRoute(info)

        while (current.layout) {
          let layoutRoute = getCacheRoute(current.layout)
          if (!layoutRoute[this._childrenName].includes(route)) {
            layoutRoute[this._childrenName].push(route)
          }
          current = current.layout
          route = layoutRoute
        }

        route.$root = true
        continue
      }

      routes.push(this.getFirstLevelRoute(info))
    }

    routes = routes.concat(
      Object.keys(cacheRoute)
        .filter((k) => cacheRoute[k].$root)
        .map((k) => cacheRoute[k])
    )

    return routes
  }

  genRoutesStr() {
    return this._routesRender(this.genRoutes(this.getFileInfos()))
  }
}

class AutoRouteWebpackPlugin {
  static loader = require.resolve('./loader.js')

  constructor(options) {
    this.id = this.constructor.name
    validate(schema, options, {name: this.id})
    this._loader = {
      test: options.loaderTest,
      options: options.loaderOptions
    }
    this._autoRoute = new AutoRoute(options)
  }

  /**
   * 触发插件方法
   * @param {Compiler} compiler
   */
  apply(compiler) {
    const {module} = compiler.options

    const initLoaderRule = {
      test: this._loader.test,
      exclude: /node_modules/,
      use: [
        {
          loader: AutoRouteWebpackPlugin.loader,
          options: this._loader.options
        }
      ]
    }

    if (module.rules) {
      module.rules.push(initLoaderRule)
    } else {
      compiler.options.module.rules = [initLoaderRule]
    }

    const normalModule = compiler.webpack.NormalModule

    compiler.hooks.thisCompilation.tap(this.id, (compilation) => {
      const routesStr = this._autoRoute.genRoutesStr()
      normalModule.getCompilationHooks(compilation).loader.tap(this.id, (loaderContext) => {
        loaderContext[NS] = routesStr
      })
    })
  }
}

module.exports = {
  FileInfo,
  AutoRoute,
  AutoRouteWebpackPlugin,
  vueRoutesRender
}
