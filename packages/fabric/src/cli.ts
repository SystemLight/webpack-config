import {copyFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'

import {Option as CommanderOption, program} from 'commander'
import chalk from 'chalk'

let {version} = require('../package.json')

function copyDotFile(filename) {
  copyFileSync(resolve(__dirname, 'ignore', filename), `./.${filename}`)
}

function initPrettier() {
  copyDotFile('prettierignore')
  writeFileSync(
    '.prettierrc.js',
    `const fabric = require('@systemlight/fabric')

module.exports = {
  ...fabric.prettier,
}`,
    {flag: 'a'}
  )
}

function initEslint() {
  copyDotFile('eslintignore')
  writeFileSync(
    '.eslintrc.js',
    `module.exports = {
  extends: [require.resolve('@systemlight/fabric/dist/eslint')]
}
`,
    {flag: 'a'}
  )
}

function initStylelint() {
  copyDotFile('stylelintignore')
  writeFileSync(
    '.stylelintrc.js',
    `module.exports = {
  extends: [require.resolve('@systemlight/fabric/dist/stylelint')]
}`,
    {flag: 'a'}
  )
}

function initGit() {
  copyDotFile('gitignore')
}

function init(type) {
  switch (type) {
    case 'prettier':
      initPrettier()
      break
    case 'eslint':
      initEslint()
      break
    case 'stylelint':
      initStylelint()
      break
    case 'git':
      initGit()
      break
  }
  console.log(`${chalk.bgCyan.black(type)} 初始化完毕`)
}

program
  .name('@systemlight/fabric')
  .usage('fabric init [--type,-t] [initType]')
  .description('生成lint规范样式')
  .version(version)

program
  .command('init')
  .description('初始化配置文件')
  .addOption(
    new CommanderOption('-t, --type [initType...]', '选择生成文件类型').choices([
      'prettier',
      'eslint',
      'stylelint',
      'git'
    ])
  )
  .action(({type}) => {
    if (!type) {
      init('prettier')
      init('eslint')
      init('stylelint')
    }

    type.forEach((v) => {
      init(v)
    })
  })

program.parse()
