function Circle (options) {
  this.position = options.position
  this.color = options.color
  this.fillColor = options.fillColor
  this.radius = options.radius
  this.width = options.width

  this._shouldRedraw = true
}

Circle.prototype.shouldRedraw = function () {
  return this._shouldRedraw
}

Circle.prototype.onadd = function (layer) {}
Circle.prototype.onremove = function (layer) {}
Circle.prototype.plot = function (layer) {}

Circle.prototype.draw = function (layer) {
  layer.drawCircle({
    position: this.position,
    color: this.color,
    fillColor: this.fillColor,
    radius: this.radius,
    width: this.width
  })

  this._shouldRedraw = false
}
