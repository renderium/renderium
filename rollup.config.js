import babel from 'rollup-plugin-babel'

export default {
  moduleName: 'Renderium',
  entry: 'src/renderium.js',
  dest: 'dist/renderium.js',
  format: 'umd',
  plugins: [
    babel()
  ]
}
