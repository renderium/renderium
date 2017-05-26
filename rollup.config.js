import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import string from 'rollup-plugin-string'

export default {
  moduleName: 'Renderium',
  entry: 'src/renderium.js',
  dest: 'dist/renderium.js',
  format: 'umd',
  plugins: [
    string({
      include: /\.glsl$/
    }),
    babel(),
    nodeResolve(),
    commonjs()
  ]
}
