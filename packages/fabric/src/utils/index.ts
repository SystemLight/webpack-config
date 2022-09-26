import process from 'process'
import fs from 'node:fs'
import path from 'node:path'

let cwd = process.cwd()
export let isTsProject: boolean = fs.existsSync(path.resolve(cwd, 'tsconfig.json'))

let packageJSON: {[key: string]: [value: string]} = require(path.join(cwd, 'package.json'))
let dependencies: string[] = Object.keys({
  // 项目依赖库数组，用于判定包含什么框架
  ...packageJSON['devDependencies'],
  ...packageJSON['dependencies']
})

export function includeLib(libName) {
  return dependencies.includes(libName)
}
