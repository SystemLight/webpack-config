#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import {program} from 'commander'
import chalk from 'chalk'
import highlight from 'cli-highlight'

let {version} = require('../package.json')

program
  .name('@systemlight/webpack-config')
  .usage('wcf init')
  .description('@systemlight/webpack-config命令行工具')
  .version(version)

program
  .command('init')
  .description('生成webpack.config.js')
  .action(function () {
    fs.writeFileSync(
      path.resolve(process.cwd(), 'webpack.config.js'),
      'module.exports = require(\'@systemlight/webpack-config\').wcf()'
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
  })

let inspect = program.command('inspect').description('弹出webpack.config.js配置内容')

inspect
  .command('build', {isDefault: true})
  .option<string>('--mode <mode>', '当前模式', transformMode, 'development')
  .action(({mode}) => printConfig(false, mode))

inspect
  .command('server')
  .option<string>('--mode <mode>', '当前模式', transformMode, 'development')
  .action(({mode}) => printConfig(true, mode))

program.parse()

function transformMode(value: string, previous: string): string {
  let m = /^(development|production)$/i.exec(value)
  return m ? m[0] : previous
}

function printConfig(isServer, mode) {
  const {toString} = require('webpack-chain')
  const webpackConfigFn = require(path.resolve(process.cwd(), 'webpack.config.js'))
  let output = toString(webpackConfigFn({WEBPACK_SERVE: isServer}, {mode}), {verbose: true})
  console.log(highlight('module.exports = ' + output, {language: 'js'}))
}
