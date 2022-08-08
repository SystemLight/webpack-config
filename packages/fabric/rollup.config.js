import {defineConfig} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import del from 'del'

let {dependencies = {}} = require('./package.json')
let commonPlugins = [nodeResolve(), typescript()]

del.sync(['dist/'])

/**
 * https://rollupjs.org/guide/en/#command-line-flags
 */
export default defineConfig([
  {
    input: 'src/main.ts',
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false,
      preserveModules:true
    },
    plugins: [...commonPlugins]
  },
  {
    input: 'src/eslint.ts',
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false,
      exports: 'default'
    },
    plugins: [...commonPlugins]
  },
  {
    input: 'src/tsEslint.ts',
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false,
      exports: 'default'
    },
    plugins: [...commonPlugins]
  },
  {
    input: 'src/stylelint.ts',
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false,
      exports: 'default'
    },
    plugins: [...commonPlugins]
  },
  {
    input: 'src/cli.ts',
    external: Object.keys(dependencies),
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false
    },
    plugins: [
      ...commonPlugins,
      commonjs(),
      copy({
        targets: [{src: 'src/ignore', dest: 'dist/'}]
      })
    ]
  }
])
