import equal from 'array-equal'
import BaseLayer from './base.js'

// -------------------------------------
// CanvasLayer
// -------------------------------------

class CanvasLayer extends BaseLayer {
  constructor ({ Vector, stats, antialiasing, width, height }) {
    super({ Vector, stats, width, height })

    this.antialiasing = Boolean(antialiasing)
    this.ctx = this.canvas.getContext('2d')

    this.scale({ width, height })

    this.imageLoader.onload = this.planRedraw.bind(this)

    this.stats = {
      stroke: 0,
      fill: 0
    }

    this.scheduler.complete('stroke')
    this.scheduler.complete('fill')
  }

  scale ({ width, height }) {
    super.scale({ width, height })

    if (window.devicePixelRatio) {
      this.ctx.scale(BaseLayer.PIXEL_RATIO, BaseLayer.PIXEL_RATIO)
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

  stateChanged ({ color, fillColor, width, lineDash, opacity }) {
    return (
      (color && color !== this.ctx.strokeStyle) ||
      (fillColor && fillColor !== this.ctx.fillStyle) ||
      (width && width !== this.ctx.lineWidth) ||
      (opacity && opacity !== this.ctx.globalAlpha) ||
      (lineDash && !equal(lineDash, this.ctx.getLineDash()))
    )
  }

  performDraw () {
    if (this.scheduler.should('stroke')) {
      this.ctx.stroke()
      this.scheduler.complete('stroke')
      this.collectStats('stroke')
    }
    if (this.scheduler.should('fill')) {
      this.ctx.fill()
      this.scheduler.complete('fill')
      this.collectStats('fill')
    }
    this.ctx.beginPath()
  }

  createGradient ({ start, end, from, to }) {
    var gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y)
    gradient.addColorStop(0, from)
    gradient.addColorStop(1, to)
    return gradient
  }

  drawArc ({ position, radius, startAngle, endAngle, color, width = 1, opacity = 1, lineDash = [] }) {
    this.performDraw()

    this.ctx.arc(position.x, position.y, radius, startAngle, endAngle)

    if (color) {
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = width
      this.ctx.globalAlpha = opacity
      this.ctx.setLineDash(lineDash)
      this.scheduler.plan('stroke')
    }
  }

  drawCircle ({ position, radius, color, fillColor, width = 1, opacity = 1, lineDash = [] }) {
    if (this.stateChanged({ color, fillColor, width, opacity, lineDash })) {
      this.performDraw()
    }

    this.drawArc({
      position,
      radius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
      color,
      width,
      opacity,
      lineDash
    })

    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.globalAlpha = opacity
      this.scheduler.plan('fill')
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

    this.ctx.globalAlpha = opacity
    if (this.antialiasing) {
      this.ctx.drawImage(image, position.x, position.y, width, height)
    } else {
      this.ctx.drawImage(image, position.x - 0.5, position.y - 0.5, width, height)
    }
  }

  drawPolygon ({ points, color, fillColor, width = 1, opacity = 1, lineDash = [] }) {
    if (this.stateChanged({ color, fillColor, width, opacity, lineDash })) {
      this.performDraw()
    }

    this.drawPolyline({
      points: points.concat(points[0]),
      color,
      width,
      opacity,
      lineDash
    })

    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.globalAlpha = opacity
      this.scheduler.plan('fill')
    }
  }

  drawPolyline ({ points, color, width = 1, opacity = 1, lineDash = [] }) {
    if (this.stateChanged({ color, width, opacity, lineDash })) {
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
      this.ctx.globalAlpha = opacity
      this.ctx.setLineDash(lineDash)
      this.scheduler.plan('stroke')
    }
  }

  drawRect ({ position, width, height, color, fillColor, strokeWidth = 1, opacity = 1, lineDash = [] }) {
    if (this.stateChanged({ color, fillColor, width: strokeWidth, opacity, lineDash })) {
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
      this.ctx.globalAlpha = opacity
      this.ctx.setLineDash(lineDash)
      this.scheduler.plan('stroke')
    }

    if (fillColor) {
      this.ctx.globalAlpha = opacity
      this.ctx.fillStyle = fillColor
      this.scheduler.plan('fill')
    }
  }

  drawText ({ position, text, color, font, size, align = 'center', baseline = 'middle', opacity = 1 }) {
    this.performDraw()

    this.ctx.fillStyle = color
    this.ctx.font = `${size}px ${font}`
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.globalAlpha = opacity

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
