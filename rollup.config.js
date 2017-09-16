import pkg from './package.json'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import string from 'rollup-plugin-string'

export default {
  input: 'src/renderium.js',
  output: [
    { file: pkg.main, format: 'umd', name: 'Renderium' },
    { file: pkg.module, format: 'es' }
  ],
  plugins: [
    string({
      include: 'src/shaders/*.glsl'
    }),
    buble(),
    nodeResolve(),
    commonjs()
  ]
}

