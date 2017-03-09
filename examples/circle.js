/*
global Animation
*/

function Circle (options) {
  this.position = options.position
  this.color = options.color
  this.fillColor = options.fillColor
  this.radius = options.radius
  this.width = options.width
  this.duration = options.duration

  this.layerWidth = 0

  this.animation = new Animation({
    duration: this.duration,
    handler: this._hanlder.bind(this)
  })
  this.animation.queue(this.animation)
}

Circle.prototype.shouldRedraw = function () {
  return true
}

Circle.prototype.onadd = function (layer) {
  this.animation.start()
}

Circle.prototype.onremove = function (layer) {
  this.animation.cancel()
}

Circle.prototype.plot = function (layer, time) {
  this.layerWidth = layer.width
  this.animation.animate(time)
}

Circle.prototype.draw = function (layer) {
  layer.drawCircle({
    position: this.position,
    color: this.color,
    fillColor: this.fillColor,
    radius: this.radius,
    width: this.width
  })
}

Circle.prototype._hanlder = function (t) {
  this.position.x = (this.position.x + this.layerWidth * t) % this.layerWidth
}
