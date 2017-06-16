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
    if (this.logStats) {
      this.drawStats()
    }
  }

  createGradient ({ start, end, from, to }) {
    var gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y)
    gradient.addColorStop(0, from)
    gradient.addColorStop(1, to)
    return gradient
  }

  getColor (color) {
    return color
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
