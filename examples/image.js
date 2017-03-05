function ImageComponent (options) {
  this.position = options.position
  this.image = options.image
  this.width = options.width
  this.height = options.height
  this.opacity = options.opacity

  this._shouldRedraw = true
}

ImageComponent.prototype.shouldRedraw = function () {
  return this._shouldRedraw
}

ImageComponent.prototype.plot = function (layer) {}

ImageComponent.prototype.draw = function (layer) {
  layer.drawImage({
    position: this.position,
    image: this.image,
    width: this.width,
    height: this.height,
    opacity: this.opacity
  })

  this._shouldRedraw = false
}
