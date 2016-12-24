import leftPad from 'left-pad'
import ImageLoader from './image-loader.js'

// -------------------------------------
// CanvasLayer
// -------------------------------------

const PIXEL_RATIO = window.devicePixelRatio || 1

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

class CanvasLayer {
  constructor ({ antialiasing, width, height }) {
    this.antialiasing = Boolean(antialiasing)
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.scale({
      width: width || CanvasLayer.DEFAULT_WIDTH,
      height: height || CanvasLayer.DEFAULT_HEIGHT
    })
    this.imageLoader = new ImageLoader()
    this.imageLoader.onload = this.forceRedraw.bind(this)

    this.components = []

    this.stats = {
      createGradient: 0,
      drawArc: 0,
      drawCircle: 0,
      drawImage: 0,
      drawPolygon: 0,
      drawPolyline: 0,
      drawRect: 0,
      drawText: 0,
      measureText: 0,
      stroke: 0,
      fill: 0
    }

    this._shouldRedraw = false
  }

  applyStyles () {
    this.ctx.canvas.style.width = `${this.width}px`
    this.ctx.canvas.style.height = `${this.height}px`
    this.ctx.canvas.style.position = 'absolute'
    this.ctx.canvas.style.top = 0
    this.ctx.canvas.style.left = 0
    this.ctx.canvas.style.right = 0
    this.ctx.canvas.style.bottom = 0
  }

  scale ({ width, height }) {
    this.width = width || CanvasLayer.DEFAULT_WIDTH
    this.height = height || CanvasLayer.DEFAULT_HEIGHT

    this.canvas.removeAttribute('width')
    this.canvas.removeAttribute('height')
    this.canvas.removeAttribute('style')

    this.ctx.canvas.width = this.width
    this.ctx.canvas.height = this.height

    this.applyStyles()

    if (window.devicePixelRatio) {
      this.ctx.canvas.width = this.width * PIXEL_RATIO
      this.ctx.canvas.height = this.height * PIXEL_RATIO
      this.ctx.scale(PIXEL_RATIO, PIXEL_RATIO)
    }

    if (!this.antialiasing) {
      this.ctx.translate(0.5, 0.5)
    }

    this.forceRedraw()
  }

  clear () {
    this.clearStats()
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.restore()
  }

  redraw () {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i]
      component.plot(this)
      component.draw(this)
    }
    this._shouldRedraw = false
  }

  forceRedraw () {
    this._shouldRedraw = true
  }

  shouldRedraw () {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i]
      if (component.shouldRedraw()) {
        return true
      }
    }
    return this._shouldRedraw
  }

  addComponent (component) {
    var idx = this.components.indexOf(component)
    if (idx !== -1) {
      throw new Error('component has already been added to layer')
    }
    if (typeof component.plot !== 'function' || typeof component.draw !== 'function' || typeof component.shouldRedraw !== 'function') {
      throw new Error('component has not implemented Component interface')
    }
    this.components.push(component)
    this.forceRedraw()
  }

  removeComponent (component) {
    var idx = this.components.indexOf(component)
    if (idx !== -1) {
      this.components.splice(idx, 1)
      this.forceRedraw()
    }
  }

  createGradient ({ start, end, from, to }) {
    return new Gradient({ start, end, from, to })
  }

  getColor (color) {
    return Gradient.isGradient(color) ? color.createGradient(this) : color
  }

  drawArc ({ position, radius, startAngle, endAngle, color, width = 1 }) {
    this.collectStats('drawArc')

    this.ctx.strokeStyle = this.getColor(color)
    this.ctx.lineWidth = width

    this.ctx.beginPath()
    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle)

    if (color) {
      this.collectStats('stroke')
      this.ctx.stroke()
    }
  }

  drawCircle ({ position, radius, color, fillColor, width = 1 }) {
    this.collectStats('drawCircle')

    this.drawArc({
      position,
      radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color,
      width
    })

    if (fillColor) {
      this.collectStats('fill')
      this.ctx.fillStyle = this.getColor(fillColor)
      this.ctx.fill()
    }
  }

  drawImage ({ position, image, width = image.width, height = image.height, opacity = 1 }) {
    this.collectStats('drawImage')

    if (typeof image === 'string') {
      if (this.imageLoader.getStatus(image) === ImageLoader.IMAGE_STATUS_LOADED) {
        image = this.imageLoader.getImage(image)
        width = width || image.width
        height = height || image.height
      } else if (this.imageLoader.getStatus(image) !== ImageLoader.IMAGE_STATUS_LOADING) {
        this.imageLoader.load(image)
        return
      } else {
        return
      }
    }

    var defaultAlpha = this.ctx.globalAlpha
    this.ctx.globalAlpha = opacity
    if (this.antialiasing) {
      this.ctx.drawImage(image, position.x, position.y, width, height)
    } else {
      this.ctx.drawImage(image, position.x - 0.5, position.y - 0.5, width, height)
    }
    this.ctx.globalAlpha = defaultAlpha
  }

  drawPolygon ({ points, color, fillColor, width = 1 }) {
    this.collectStats('drawPolygon')

    this.drawPolyline({
      points: points.concat(points[0]),
      color,
      width
    })

    if (fillColor) {
      this.collectStats('fill')
      this.ctx.fillStyle = this.getColor(fillColor)
      this.ctx.fill()
    }
  }

  drawPolyline ({ points, color, lineDash = [], width = 1 }) {
    this.collectStats('drawPolyline')

    this.ctx.lineWidth = width

    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (var i = 1, point; i < points.length; i++) {
      point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }

    this.ctx.setLineDash(lineDash)

    if (points[0].equals(points[points.length - 1])) {
      this.ctx.closePath()
    }

    if (color) {
      this.collectStats('stroke')
      this.ctx.strokeStyle = this.getColor(color)
      this.ctx.stroke()
    }
  }

  drawRect ({ position, width, height, color, fillColor, strokeWidth = 1 }) {
    this.collectStats('drawRect')

    this.ctx.lineWidth = strokeWidth

    this.ctx.beginPath()
    if (this.antialiasing) {
      this.ctx.rect(position.x, position.y, width, height)
    } else {
      this.ctx.rect(position.x - 0.5, position.y - 0.5, width, height)
    }
    this.ctx.closePath()

    if (color) {
      this.collectStats('stroke')
      this.ctx.strokeStyle = this.getColor(color)
      this.ctx.stroke()
    }

    if (fillColor) {
      this.collectStats('fill')
      this.ctx.fillStyle = this.getColor(fillColor)
      this.ctx.fill()
    }
  }

  drawText ({ position, text, color, font, size, align = 'center', baseline = 'middle' }) {
    this.collectStats('drawText')

    this.ctx.fillStyle = this.getColor(color)
    this.ctx.font = `${size}px ${font}`
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline

    this.ctx.fillText(text, position.x, position.y)
  }

  measureText ({ text, font, size }) {
    this.collectStats('measureText')

    var width
    if (font && size) {
      var defaultFont = this.ctx.font
      this.ctx.font = `${size}px ${font}`
      width = this.ctx.measureText(text).width
      this.ctx.font = defaultFont
    } else {
      width = this.ctx.measureText(text).width
    }
    return width
  }

  clearStats () {
    for (var methodName in this.stats) {
      this.stats[methodName] = 0
    }
  }

  collectStats (methodName) {
    this.stats[methodName]++
  }

  formatStats () {
    var result = []
    var maxStringLength = 20

    for (var methodName in this.stats) {
      result.push(methodName + leftPad(this.stats[methodName], maxStringLength - methodName.length))
    }

    return result
  }

  drawStats () {

  }
}

CanvasLayer.DEFAULT_WIDTH = 100
CanvasLayer.DEFAULT_HEIGHT = 100

export default CanvasLayer
