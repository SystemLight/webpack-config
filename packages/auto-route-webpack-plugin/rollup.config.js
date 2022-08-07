import {defineConfig} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import del from 'del'

let {dependencies = {}} = require('./package.json')
let commonPlugins = [nodeResolve(), typescript()]

del.sync(['dist/'])

/**
 * https://rollupjs.org/guide/en/#command-line-flags
 */
export default defineConfig({
  input: 'src/main.ts',
  external: Object.keys(dependencies),
  output: {
    dir: 'dist/',
    format: 'cjs',
    sourcemap: false
  },
  plugins: [...commonPlugins]
})
