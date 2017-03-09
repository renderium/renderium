function Arc (options) {
  this.position = options.position
  this.color = options.color
  this.radius = options.radius
  this.startAngle = options.startAngle
  this.endAngle = options.endAngle
  this.width = options.width

  this._shouldRedraw = true
}

Arc.prototype.shouldRedraw = function () {
  return this._shouldRedraw
}

Arc.prototype.onadd = function (layer) {}
Arc.prototype.onremove = function (layer) {}
Arc.prototype.plot = function (layer) {}

Arc.prototype.draw = function (layer) {
  layer.drawArc({
    position: this.position,
    color: this.color,
    radius: this.radius,
    startAngle: this.startAngle,
    endAngle: this.endAngle,
    width: this.width
  })

  this._shouldRedraw = false
}
