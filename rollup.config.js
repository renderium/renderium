import pkg from './package.json'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/renderium.js',
  output: [
    { file: pkg.main, format: 'umd', name: 'Renderium' },
    { file: pkg.module, format: 'es' }
  ],
  plugins: [
    buble(),
    nodeResolve(),
    commonjs()
  ]
}

