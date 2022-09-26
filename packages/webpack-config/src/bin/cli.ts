#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import {program} from 'commander'
import chalk from 'chalk'

let {version} = require('../package.json')

function init() {
  fs.writeFileSync(
    path.resolve(process.cwd(), 'webpack.config.js'),
    'const {wcf} = require(\'@systemlight/webpack-config\')\n' + '\n' + 'module.exports = wcf({})\n'
  )
  console.log(`初始化生成 ${chalk.bgCyan.black('webpack.config.js')}`)

  let scripts = {
    'build:webpack': 'webpack --mode production',
    'dev:webpack-serve': 'webpack serve --mode development',
    serve: 'npm run dev:webpack-serve',
    build: 'npm run build:webpack'
  }
  let packageJsonPath = path.resolve(process.cwd(), 'package.json')
  let packageJson = require(packageJsonPath)
  packageJson['scripts']
    ? (packageJson['scripts'] = {...packageJson['scripts'], ...scripts})
    : (packageJson['scripts'] = scripts)
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log(`初始化生成 ${chalk.bgCyan.black('package.json:scripts')}`)

  console.log(chalk.blueBright('初始化生成完毕'))
}

program
  .name('@systemlight/webpack-config')
  .usage('wcf init')
  .description('@systemlight/webpack-config命令行工具')
  .version(version)

program.command('init').description('生成webpack.config.js').action(init)

program.parse()
