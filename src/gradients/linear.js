class LinearGradient {
  static isGradient (color) {
    return color && color._isGradient
  }

  constructor ({ start, end, from, to }) {
    this.start = start
    this.end = end
    this.from = from
    this.to = to

    this._isGradient = true
  }
}

export default LinearGradient
