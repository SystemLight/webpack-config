const fs = require('fs')
const path = require('path')

const {customAlphabet} = require('nanoid')
const {validate} = require('schema-utils')
const stringifyObject = require('stringify-object')

const schema = require('./schema.json')

/**
 * @typedef FileInfo
 * @property {String} id
 * @property {FileInfo | null} parent
 * @property {FileInfo | null} layout
 * @property {String} name
 * @property {String} nameWithExt
 * @property {Boolean} isDirectory
 * @property {String} fullPath
 */

// https://tooltt.com/regulex/
class WalkWebpackPlugin {
  constructor(options) {
    this.id = this.constructor.name

    validate(schema, options, {name: this.id})
    let {
      targetPath,
      importPath,
      publicPath = '/',
      ignores = [],
      ignoreFiles = [],
      ignoreFolders = [],
      renderRoute = null,
      childrenName = 'routes'
    } = options

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
    this._nanoid = customAlphabet('1234567890abcdef', 10)
    this._dynamicRouteMatchG = /\[((.*?)\$?)]/g
    this._dynamicRouteMatch = /\[((.*?)\$?)]/

    this._renderRoute = renderRoute || ((v) => v)
    this._childrenName = childrenName
  }

  getInfos() {
    let _name = path.basename(this.targetPath)
    /**
     * 文件信息栈
     * @type {FileInfo[]}
     */
    let fileInfoStack = [
      {
        id: this._nanoid(),
        parent: null,
        layout: null,
        name: _name.split('.')[0],
        nameWithExt: _name,
        fullPath: this.targetPath,
        isDirectory: null
      }
    ]
    let infos = []

    while (fileInfoStack.length > 0) {
      let currentItem = fileInfoStack.pop()
      let stat = fs.statSync(currentItem.fullPath)
      if (stat.isDirectory()) {
        if (this.ignoreFolders.some((v) => v.test(currentItem.name))) {
          // 如果文件夹名称符合则忽略
          continue
        }

        currentItem.isDirectory = true
        let children = fs.readdirSync(currentItem.fullPath)

        //  获取目录下是否含有_layout开头的文件
        let layoutFileInfo = currentItem.layout
        let layoutChildren = children.filter((v) => v.startsWith(this._layout))
        if (layoutChildren.length > 0) {
          let layoutFullPath = path.resolve(currentItem.fullPath, layoutChildren[0])
          if (fs.statSync(layoutFullPath).isFile()) {
            layoutFileInfo = {
              id: this._nanoid(),
              parent: currentItem,
              layout: currentItem.layout,
              name: this._layout,
              nameWithExt: layoutChildren[0],
              isDirectory: null,
              fullPath: layoutFullPath
            }
            children = children.filter((v) => v !== layoutFileInfo.nameWithExt)
          }
        }

        fileInfoStack = fileInfoStack.concat(
          children.map((v) => {
            return {
              id: this._nanoid(),
              parent: currentItem,
              layout: layoutFileInfo,
              name: v.split('.')[0],
              nameWithExt: v,
              isDirectory: null,
              fullPath: path.resolve(currentItem.fullPath, v)
            }
          })
        )
      } else {
        if (this.ignoreFolders.some((v) => v.test(currentItem.name))) {
          // 如果文件名称符合则忽略
          continue
        }

        currentItem.isDirectory = false
        infos.push(currentItem)
      }
    }

    return infos
  }

  /**
   * 生成路径结构
   * @param {FileInfo} info
   * @return {String} parentPath
   */
  getParentPath(info) {
    let parentPath = []
    let currentParent = info.parent

    while (currentParent.parent) {
      parentPath.push(currentParent.name)
      currentParent = currentParent.parent
    }
    return parentPath.reverse().join('/')
  }

  getPublicStr(str) {
    if (str.endsWith('/')) {
      return str.substring(0, str.length - 1)
    }

    return str
  }

  getUrl(info, parentPath) {
    let urlPath = [this.getPublicStr(this.publicPath)]
    if (parentPath) {
      urlPath.push(parentPath)
    }
    if (info.name !== 'index') {
      urlPath.push(info.name)
    }
    urlPath = urlPath.join('/')
    urlPath = urlPath ? urlPath : this.publicPath

    let matcher = urlPath.match(this._dynamicRouteMatch)
    if (matcher) {
      if (matcher[1].endsWith('$')) {
        urlPath = urlPath.replace(this._dynamicRouteMatchG, ':$2?')
      } else {
        urlPath = urlPath.replace(this._dynamicRouteMatchG, ':$2')
      }
    }

    return urlPath.replace(/\/_layout$/, '')
  }

  getImport(info, parentPath) {
    let importPath = [this.getPublicStr(this.importPath)]
    if (parentPath) {
      importPath.push(parentPath)
    }
    importPath.push(info.nameWithExt)
    return importPath.join('/')
  }

  /**
   * 生成一级路由
   * @param {FileInfo} info
   * @param {Boolean} exact
   */
  getFirstLevelRoute(info, exact = true) {
    let parentPath = this.getParentPath(info)
    let name = info.name + '-' + info.id
    if (info.name === 'index' || info.name === '_layout') {
      name = info.parent.name + '-' + name
    }
    return {
      ...this._renderRoute({
        name: name,
        exact: exact,
        path: this.getUrl(info, parentPath),
        component: this.getImport(info, parentPath)
      }),
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
    return stringifyObject(this.genRoutes(this.getInfos()), {indent: '  '})
  }

  apply(compiler) {
    console.log(this.genRoutesStr())
  }
}

module.exports = WalkWebpackPlugin
