import {defineConfig} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import shebang from 'rollup-plugin-preserve-shebang'

let {dependencies = {}} = require('./package.json')
let commonPlugins = [nodeResolve(), typescript()]

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
      preserveModules: true,
      exports: 'auto'
    },
    plugins: [
      ...commonPlugins,
      del({targets: 'dist/*'})
    ]
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
      }),
      shebang()
    ]
  }
])
