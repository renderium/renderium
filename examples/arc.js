/*
global Animation
*/

function Arc (options) {
  this.position = options.position
  this.color = options.color
  this.radius = options.radius
  this.startAngle = options.startAngle
  this.endAngle = options.endAngle
  this.width = options.width
  this.duration = options.duration

  this.animation = new Animation({
    duration: this.duration,
    handler: this._hanlder.bind(this)
  })
  this.animation.queue(this.animation)
}

Arc.prototype.shouldRedraw = function () {
  return true
}

Arc.prototype.onadd = function (layer) {
  this.animation.start()
}

Arc.prototype.onremove = function (layer) {
  this.animation.stop()
}

Arc.prototype.plot = function (layer, time) {
  this.animation.animate(time)
}

Arc.prototype.draw = function (layer) {
  layer.drawArc({
    position: this.position,
    color: this.color,
    radius: this.radius,
    startAngle: this.startAngle,
    endAngle: this.endAngle,
    width: this.width
  })
}

Arc.prototype._hanlder = function (t) {
  var theta = t * (Math.PI * 2)
  this.startAngle += theta
  this.endAngle += theta
}
