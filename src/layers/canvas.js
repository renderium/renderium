import equal from 'array-equal'
import BaseLayer from './base.js'

// -------------------------------------
// CanvasLayer
// -------------------------------------

const PIXEL_RATIO = window.devicePixelRatio || 1

class CanvasLayer extends BaseLayer {
  constructor ({ Vector, stats, antialiasing, width, height }) {
    super({ Vector, stats, width, height })

    this.antialiasing = Boolean(antialiasing)
    this.ctx = this.canvas.getContext('2d')

    this.scale({ width, height })

    this.imageLoader.onload = this.forceRedraw.bind(this)

    this.stats = {
      stroke: 0,
      fill: 0
    }

    this._shouldStroke = false
    this._shouldFill = false
  }

  scale ({ width, height }) {
    super.scale({ width, height })

    if (window.devicePixelRatio) {
      this.canvas.width = this.width * PIXEL_RATIO
      this.canvas.height = this.height * PIXEL_RATIO
      this.ctx.scale(PIXEL_RATIO, PIXEL_RATIO)
    }

    if (!this.antialiasing) {
      this.ctx.translate(0.5, 0.5)
    }
  }

  clear () {
    super.clear()
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.restore()
  }

  redraw (time) {
    super.redraw(time)
    this.performDraw()
    if (this.logStats) {
      this.drawStats()
    }
  }

  stateChanged ({ color, fillColor, width, lineDash }) {
    return (
      (color && color !== this.ctx.strokeStyle) ||
      (fillColor && fillColor !== this.ctx.fillStyle) ||
      (width && width !== this.ctx.lineWidth) ||
      (lineDash && !equal(lineDash, this.ctx.getLineDash()))
    )
  }

  performDraw () {
    if (this.shouldStroke()) {
      this.ctx.stroke()
      this.completeStroke()
      this.collectStats('stroke')
    }
    if (this.shouldFill()) {
      this.ctx.fill()
      this.completeFill()
      this.collectStats('fill')
    }
    this.ctx.beginPath()
  }

  forceStroke () {
    this._shouldStroke = true
  }

  completeStroke () {
    this._shouldStroke = false
  }

  shouldStroke () {
    return this._shouldStroke
  }

  forceFill () {
    this._shouldFill = true
  }

  completeFill () {
    this._shouldFill = false
  }

  shouldFill () {
    return this._shouldFill
  }

  createGradient ({ start, end, from, to }) {
    var gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y)
    gradient.addColorStop(0, from)
    gradient.addColorStop(1, to)
    return gradient
  }

  drawArc ({ position, radius, startAngle, endAngle, color, width = 1 }) {
    if (this.stateChanged({ color, width })) {
      this.performDraw()
    }

    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle)

    if (color) {
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = width
      this.forceStroke()
    }
  }

  drawCircle ({ position, radius, color, fillColor, width = 1 }) {
    if (this.stateChanged({ color, fillColor, width })) {
      this.performDraw()
    }

    this.drawArc({
      position,
      radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color,
      width
    })

    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.forceFill()
    }
  }

  drawImage ({ position, image, width = image.width, height = image.height, opacity = 1 }) {
    this.performDraw()

    if (typeof image === 'string') {
      if (this.imageLoader.getStatus(image) === this.imageLoader.IMAGE_STATUS_LOADED) {
        image = this.imageLoader.getImage(image)
        width = width || image.width
        height = height || image.height
      } else if (this.imageLoader.getStatus(image) !== this.imageLoader.IMAGE_STATUS_LOADING) {
        this.imageLoader.load(image)
        return
      } else {
        return
      }
    }

    this.ctx.save()
    this.ctx.globalAlpha = opacity
    if (this.antialiasing) {
      this.ctx.drawImage(image, position.x, position.y, width, height)
    } else {
      this.ctx.drawImage(image, position.x - 0.5, position.y - 0.5, width, height)
    }
    this.ctx.restore()
  }

  drawPolygon ({ points, color, fillColor, width = 1 }) {
    if (this.stateChanged({ color, fillColor, width })) {
      this.performDraw()
    }

    this.drawPolyline({
      points: points.concat(points[0]),
      color,
      width
    })

    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.forceFill()
    }
  }

  drawPolyline ({ points, color, width = 1, lineDash = [] }) {
    if (this.stateChanged({ color, width, lineDash })) {
      this.performDraw()
    }

    this.ctx.moveTo(points[0].x, points[0].y)

    for (var i = 1, point; i < points.length; i++) {
      point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }

    if (points[0].equals(points[points.length - 1])) {
      this.ctx.closePath()
    }

    if (color) {
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = width
      this.ctx.setLineDash(lineDash)
      this.forceStroke()
    }
  }

  drawRect ({ position, width, height, color, fillColor, strokeWidth = 1 }) {
    if (this.stateChanged({ color, fillColor, width: strokeWidth })) {
      this.performDraw()
    }

    if (this.antialiasing) {
      this.ctx.rect(position.x, position.y, width, height)
    } else {
      this.ctx.rect(position.x - 0.5, position.y - 0.5, width, height)
    }

    if (color) {
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = strokeWidth
      this.forceStroke()
    }

    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.forceFill()
    }
  }

  drawText ({ position, text, color, font, size, align = 'center', baseline = 'middle' }) {
    this.collectStats('drawText')

    this.ctx.fillStyle = color
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

  drawStats () {
    var stats = this.formatStats()

    for (var i = stats.length; i--;) {
      this.drawText({
        position: new this.Vector(this.width - 10, this.height - 14 * (stats.length - i)),
        text: stats[i],
        color: '#fff',
        font: 'Courier, monospace',
        size: 14,
        align: 'right',
        baleline: 'bottom'
      })
    }
  }
}

export default CanvasLayer
