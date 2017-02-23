class Gradient {
  static isGradient (color) {
    return color && color._isGradient
  }

  constructor ({ start, end, from, to }) {
    this.start = start
    this.end = end
    this.from = from
    this.to = to

    this._isGradient = true
    this._gradient = null
  }

  createGradient (layer) {
    layer.collectStats('createGradient')

    this._gradient = layer.ctx.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y)
    this._gradient.addColorStop(0, this.from)
    this._gradient.addColorStop(1, this.to)
    return this._gradient
  }

  valueOf () {
    return this._gradient
  }
}

export default Gradient
