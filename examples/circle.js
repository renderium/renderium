/*
global Animation
*/

function Circle (options) {
  this.position = options.position
  this.color = options.color
  this.fillColor = options.fillColor
  this.minRadius = options.minRadius
  this.maxRadius = options.maxRadius
  this.width = options.width
  this.duration = options.duration
  this.delay = options.delay

  this._radius = this.minRadius

  this.animationDelay = new Animation({
    duration: this.delay
  })
  this.animationGrowUp = new Animation({
    duration: this.duration,
    handler: this._growUpHanlder.bind(this)
  })
  this.animationGrowDown = new Animation({
    duration: this.duration,
    handler: this._growDownHanlder.bind(this)
  })
  this.animationDelay.queue(this.animationGrowUp)
  this.animationGrowUp.queue(this.animationGrowDown)
  this.animationGrowDown.queue(this.animationDelay)
}

Circle.prototype.shouldRedraw = function () {
  return true
}

Circle.prototype.onadd = function (layer) {
  this.animationDelay.start()
}

Circle.prototype.onremove = function (layer) {
  this.animationDelay.stop()
  this.animationGrowUp.stop()
  this.animationGrowDown.stop()
}

Circle.prototype.plot = function (layer, time) {
  Animation.animate(time)
}

Circle.prototype.draw = function (layer) {
  layer.drawCircle({
    position: this.position,
    color: this.color,
    fillColor: this.fillColor,
    radius: this._radius,
    width: this.width
  })
}

Circle.prototype._growUpHanlder = function (t) {
  this._radius = this.minRadius + t * (this.maxRadius - this.minRadius)
}

Circle.prototype._growDownHanlder = function (t) {
  this._radius = this.maxRadius - t * (this.maxRadius - this.minRadius)
}
