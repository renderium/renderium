import BaseLayer from '../base-layer'
import Gradient from './gradient.js'
import * as utils from './utils.js'
import vertextShaderSource from './vertex.glsl'
import fragmentShaderSource from './fragment.glsl'

// -------------------------------------
// WebglLayer
// -------------------------------------

class WebglLayer extends BaseLayer {
  constructor ({ Vector, stats, width, height }) {
    super({ Vector, stats, width, height })

    this.gl = utils.getContext(this.canvas)

    this.scale({ width, height })

    this.imageLoader.onload = this.forceRedraw.bind(this)

    this.positions = []

    this._vertexShader = utils.compileShader(this.gl, vertextShaderSource, this.gl.VERTEX_SHADER)
    this._fragmentShader = utils.compileShader(this.gl, fragmentShaderSource, this.gl.FRAGMENT_SHADER)

    this._program = utils.createProgram(this.gl, this._vertexShader, this._fragmentShader)
    this.gl.useProgram(this._program)

    this._positionLocation = this.gl.getAttribLocation(this._program, 'a_position')
    this._colorLocation = this.gl.getAttribLocation(this._program, 'a_color')

    this._buffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffer)
    this.gl.enableVertexAttribArray(this._positionLocation)
    this.gl.vertexAttribPointer(
      this._positionLocation,
      2,
      this.gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 6,
      0
    )
    this.gl.enableVertexAttribArray(this._colorLocation)
    this.gl.vertexAttribPointer(
      this._colorLocation,
      4,
      this.gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 6,
      Float32Array.BYTES_PER_ELEMENT * 2
    )
  }

  scale ({ width, height }) {
    super.scale({ width, height })

    if (window.devicePixelRatio) {
      this.canvas.width = this.width *= window.devicePixelRatio
      this.canvas.height = this.height *= window.devicePixelRatio
    }

    this.gl.viewport(0, 0, this.width, this.height)
  }

  clear () {
    super.clear()
    this.positions = []
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clearDepth(1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  redraw () {
    super.redraw()

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.positions),
      this.gl.STATIC_DRAW
    )
    this.gl.drawArrays(this.gl.LINES, 0, this.positions.length / 6)
  }

  convertPoints (points) {
    var result = []
    for (var i = 0; i < points.length; i++) {
      var point = points[i]
      var x = point.x
      var y = point.y
      result.push(new this.Vector(x / this.width * 2 - 1, y / this.height * -2 + 1))
    }
    return result
  }

  createGradient ({ start, end, from, to }) {
    return new Gradient({ start, end, from, to })
  }

  getColor (color) {
    return Gradient.isGradient(color) ? color.createGradient(this) : utils.parseColor(color)
  }

  drawArc ({ position, radius, startAngle, endAngle, color, width = 1 }) {

  }

  drawCircle ({ position, radius, color, fillColor, width = 1 }) {

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
  }

  drawPolygon ({ points, color, fillColor, width = 1 }) {
    this.collectStats('drawPolygon')

    this.drawPolyline({
      points: points.concat(points[0]),
      color,
      width
    })
  }

  drawPolyline ({ points, color, lineDash = [], width = 1 }) {
    this.collectStats('drawPolyline')

    points = this.convertPoints(points)
    color = this.getColor(color)
    for (var i = 1; i < points.length; i++) {
      this.positions.push(points[i - 1].x, points[i - 1].y, color[0], color[1], color[2], 1)
      this.positions.push(points[i].x, points[i].y, color[0], color[1], color[2], 1)
    }
  }

  drawRect ({ position, width, height, color, fillColor, strokeWidth = 1 }) {

  }

  drawText ({ position, text, color, font, size, align = 'center', baseline = 'middle' }) {

  }

  measureText ({ text }) {
    return 0
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

export default WebglLayer
