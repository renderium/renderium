import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  moduleName: 'Renderium',
  entry: 'src/renderium.js',
  dest: 'dist/renderium.js',
  format: 'umd',
  plugins: [
    babel(),
    nodeResolve(),
    commonjs()
  ]
}
