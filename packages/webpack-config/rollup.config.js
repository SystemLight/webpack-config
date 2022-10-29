import {defineConfig} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import shebang from 'rollup-plugin-preserve-shebang'

let {dependencies = {}, devDependencies = {}} = require('./package.json')
let external = [
  ...Object.keys(dependencies),
  ...Object.keys(devDependencies),
  /package.json/,
  /node-forge/
]

let commonPlugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    exclude: ['tests/**/*'],
    module: 'ESNext'
  })
]

/**
 * https://rollupjs.org/guide/en/#command-line-flags
 */
export default defineConfig([
  {
    input: 'src/index.ts',
    external: external,
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false
    },
    plugins: [
      ...commonPlugins,
      del({targets: 'dist/*'})
    ]
  },
  {
    input: 'src/bin/cli.ts',
    external: external,
    output: {
      dir: 'dist/',
      format: 'cjs',
      sourcemap: false
    },
    plugins: [
      ...commonPlugins,
      shebang()
    ]
  }
])
