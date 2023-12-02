import fs from 'fs'
import path from 'path'

const scopedModuleRegex = new RegExp('@[a-zA-Z0-9][\\w-.]+/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9./]+)?', 'g')
const atPrefix = new RegExp('^@', 'g')

export function getModuleName(request: string, includeAbsolutePaths: boolean): string {
  const delimiter = '/'

  if (includeAbsolutePaths) {
    request = request.replace(/^.*?\/node_modules\//, '')
  }

  if (scopedModuleRegex.test(request)) {
    scopedModuleRegex.lastIndex = 0
    return request.split(delimiter, 2).join(delimiter)
  }

  return request.split(delimiter)[0]
}

export function readDir(dirName) {
  if (!fs.existsSync(dirName)) {
    return []
  }

  try {
    return fs
      .readdirSync(dirName)
      .map(function (module) {
        if (atPrefix.test(module)) {
          atPrefix.lastIndex = 0
          try {
            return fs.readdirSync(path.join(dirName, module)).map(function (scopedMod) {
              return module + '/' + scopedMod
            })
          } catch (e) {
            return [module]
          }
        }
        return module
      })
      .reduce(function (prev: string[], next) {
        return prev.concat(next)
      }, [])
  } catch (e) {
    return []
  }
}

export function contains(arr: string | any[], val: string) {
  return arr && arr.indexOf(val) !== -1
}

export function getNodeModules() {
  return readDir('node_modules').filter((x) => !contains(['.bin'], x))
}

export function matchSrcExternalModuleFactory(matchContent: RegExp) {
  let nodeModules = getNodeModules()
  return (request: string) => {
    let moduleName = getModuleName(request, false)
    if (contains(nodeModules, moduleName)) {
      return false
    }
    return matchContent.test(request)
  }
}
