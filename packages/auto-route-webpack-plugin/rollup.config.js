import {defineConfig} from 'rollup'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import del from 'del'

del.sync(['dist/'])

let {dependencies = {}, devDependencies = {}} = require('./package.json')

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
      exports: 'auto'
    },
    external: [
      ...Object.keys(dependencies),
      ...Object.keys(devDependencies),
      /package.json/
    ],
    plugins: [
      nodeResolve(),
      json(),
      typescript(),
      copy({
        targets: [{src: 'src/schema.json', dest: 'dist/'}]
      })
    ]
  },
  {
    input: 'src/loader.ts',
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false,
      exports: 'auto'
    },
    external: [
      ...Object.keys(dependencies),
      ...Object.keys(devDependencies),
      /package.json/
    ],
    plugins: [
      nodeResolve(),
      json(),
      typescript()
    ]
  }
])
