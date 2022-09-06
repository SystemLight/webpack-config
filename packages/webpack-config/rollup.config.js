import {defineConfig} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'

let {dependencies = {}, devDependencies = {}} = require('./package.json')

/**
 * https://rollupjs.org/guide/en/#command-line-flags
 */
export default defineConfig({
  input: 'src/index.ts',
  external: [
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies),
    /package.json/,
    /node-forge/
  ],
  output: {
    dir: 'dist/',
    format: 'cjs',
    sourcemap: false
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      module: 'ESNext'
    }),
    del({targets: 'dist/*'})
  ]
})
