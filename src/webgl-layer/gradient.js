import { parseColor } from './utils.js'

class Gradient {
  static isGradient (color) {
    return color && color._isGradient
  }

  constructor ({ start, end, from, to }) {
    this.start = start
    this.end = end
    this.from = parseColor(from)
    this.to = parseColor(to)

    this._isGradient = true
    this._gradient = null
  }

  createGradient (layer) {
    layer.collectStats('createGradient')

    return this.from
  }

  valueOf () {
    return this.from
  }
}

export default Gradient
