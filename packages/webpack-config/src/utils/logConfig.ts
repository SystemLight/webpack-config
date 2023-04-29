import {highlight} from 'cli-highlight'

function logConfig(emitConfig: any) {
  const {toString: webpackChainToString} = require('webpack-chain')
  let output = webpackChainToString(emitConfig, {verbose: true})
  console.log(highlight('module.exports = ' + output, {language: 'js'}))
  return emitConfig
}

export default logConfig
