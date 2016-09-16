import Vector from 'vectory'
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
  static createGradient ({ start, end, from, to }) {
    return new Gradient({ start, end, from, to })
  }

  constructor ({ antialiasing, width, height }) {
    this.antialiasing = Boolean(antialiasing)
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.scale({
      width: width || CanvasLayer.DEFAULT_WIDTH,
      height: height || CanvasLayer.DEFAULT_HEIGHT
    })
    this.imageLoader = new ImageLoader()
  }

  scale ({ width, height }) {
    this.width = width || CanvasLayer.DEFAULT_WIDTH
    this.height = height || CanvasLayer.DEFAULT_HEIGHT

    this.canvas.removeAttribute('width')
    this.canvas.removeAttribute('height')
    this.canvas.removeAttribute('style')

    this.ctx.canvas.width = this.width
    this.ctx.canvas.height = this.height
    this.ctx.canvas.style.width = `${this.width}px`
    this.ctx.canvas.style.height = `${this.height}px`

    if (window.devicePixelRatio) {
      this.ctx.canvas.width = this.width * PIXEL_RATIO
      this.ctx.canvas.height = this.height * PIXEL_RATIO
      this.ctx.scale(PIXEL_RATIO, PIXEL_RATIO)
    }

    if (!this.antialiasing) {
      this.ctx.translate(0.5, 0.5)
    }
  }

  clear () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  getColor (color) {
    return Gradient.isGradient(color) ? color.createGradient(this) : color
  }

  drawArc ({ position, radius, startAngle, endAngle, color, width = 1 }) {
    this.ctx.strokeStyle = this.getColor(color)
    this.ctx.lineWidth = width

    this.ctx.beginPath()
    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle)
    this.ctx.stroke()
  }

  drawArea ({ points, threshold, color, fillColor, width = 1 }) {
    this.drawPolyline({
      points,
      color,
      width
    })

    this.ctx.fillStyle = this.getColor(fillColor)

    this.ctx.lineTo(points[points.length - 1].x, threshold)
    this.ctx.lineTo(points[0].x, threshold)
    this.ctx.closePath()
    this.ctx.fill()
  }

  drawCircle ({ position, radius, color, fillColor, width = 1 }) {
    this.drawArc({
      position,
      radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color,
      width
    })

    if (fillColor) {
      this.ctx.fillStyle = this.getColor(fillColor)
      this.ctx.fill()
    }
  }

  drawImage ({ position, image, width = image.width, height = image.height, opacity = 1 }) {
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
    this.ctx.drawImage(image, position.x - width / 2, position.y - height / 2, width, height)
    this.ctx.globalAlpha = defaultAlpha
  }

  drawPolygon ({ points, color, fillColor, width = 1 }) {
    this.drawPolyline({
      points: points.concat(points[0]),
      color,
      width
    })

    if (fillColor) {
      this.ctx.fillStyle = this.getColor(fillColor)
      this.ctx.fill()
    }
  }

  drawPolyline ({ points, color, lineDash = [], width = 1 }) {
    this.ctx.strokeStyle = this.getColor(color)
    this.ctx.lineWidth = width
    this.ctx.lineJoin = 'round'

    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (var i = 1, point; i < points.length; i++) {
      point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }

    this.ctx.setLineDash(lineDash)

    this.ctx.stroke()
  }

  drawRect ({ position, width, height, color, fillColor, strokeWidth = 1 }) {
    this.drawPolygon({
      points: [
        new Vector(position.x - width / 2, position.y + height / 2),
        new Vector(position.x + width / 2, position.y + height / 2),
        new Vector(position.x + width / 2, position.y - height / 2),
        new Vector(position.x - width / 2, position.y - height / 2)
      ],
      color: color,
      fillColor: fillColor,
      width: strokeWidth
    })
  }

  drawText ({ position, text, color, font, size, align = 'center', baseline = 'middle' }) {
    this.ctx.fillStyle = this.getColor(color)
    this.ctx.font = `${size}px ${font}`
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline

    this.ctx.fillText(text, position.x, position.y)
  }

  measureText ({ text, font, size }) {
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
}

CanvasLayer.DEFAULT_WIDTH = 100
CanvasLayer.DEFAULT_HEIGHT = 100
CanvasLayer.GRADIENT_DIRECTION_TOP_TO_BOT = 'top-to-bot'
CanvasLayer.EXTRA_PIXELS = 10

export default CanvasLayer
