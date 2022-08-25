import {defineConfig} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import del from 'del'

let {dependencies = {}, devDependencies = {}} = require('./package.json')

del.sync(['dist/'])

/**
 * https://rollupjs.org/guide/en/#command-line-flags
 */
export default defineConfig({
  input: 'src/index.ts',
  external: [
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies),
    /package.json/
  ],
  output: {
    dir: 'dist/',
    format: 'cjs',
    sourcemap: false
  },
  plugins: [
    nodeResolve(),
    typescript({
      module: 'ESNext'
    }),
    commonjs()
  ]
})
