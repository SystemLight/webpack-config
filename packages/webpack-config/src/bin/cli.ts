#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as child_process from 'child_process'

import {program} from 'commander'
import chalk from 'chalk'

import logConfig from '../utils/logConfig'
import * as process from 'process'

let {version} = require('../package.json')
let webpackConfigPath = path.resolve(process.cwd(), 'webpack.config.js')

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
      serve: 'webpack serve --mode development',
      build: 'webpack --mode production',
      preview: 'wcf preview'
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

program
  .command('preview')
  .description('预览编译项目')
  .option('--mode <mode>', '当前WCF编译模式', 'preview')
  .action(function ({mode}) {
    // webpack --mode 只支持有效的production development，该选项扩展了这个操作
    process.env.WCF_MODE = mode
    runNpm(['run', 'build'])
  })

let inspect = program.command('inspect').description('弹出webpack.config.js配置内容')

inspect
  .command('build', {isDefault: true})
  .option<string>('--mode <mode>', '当前模式', transformMode, 'development')
  .action(async ({mode}) => {
    let config = await require(webpackConfigPath)({WEBPACK_SERVE: false}, {mode})
    logConfig(config)
  })

inspect
  .command('server')
  .option<string>('--mode <mode>', '当前模式', transformMode, 'development')
  .action(async ({mode}) => {
    let config = await require(webpackConfigPath)({WEBPACK_SERVE: true}, {mode})
    logConfig(config)
  })

program.parse()

function transformMode(value: string, previous: string): string {
  let m = /^(development|production)$/i.exec(value)
  return m ? m[0] : previous
}

function runNpm(args: any) {
  let npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  child_process.spawnSync(npmCmd, args, {
    stdio: 'inherit'
  })
}
