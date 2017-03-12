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

    this.vertices = []
    this.indices = []

    this._vertexShader = utils.compileShader(this.gl, vertextShaderSource, this.gl.VERTEX_SHADER)
    this._fragmentShader = utils.compileShader(this.gl, fragmentShaderSource, this.gl.FRAGMENT_SHADER)

    this._program = utils.createProgram(this.gl, this._vertexShader, this._fragmentShader)
    this.gl.useProgram(this._program)

    this._resolutionLocation = this.gl.getUniformLocation(this._program, 'u_resolution')
    this._positionLocation = this.gl.getAttribLocation(this._program, 'a_position')
    this._colorLocation = this.gl.getAttribLocation(this._program, 'a_color')

    this._verticesBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._verticesBuffer)

    this._indicesBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer)

    this.gl.enableVertexAttribArray(this._positionLocation)
    this.gl.enableVertexAttribArray(this._colorLocation)

    this.gl.vertexAttribPointer(
      this._positionLocation,
      this.POSITION_SIZE,
      this.gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * this.ATTRIBUTES_SIZE,
      0
    )
    this.gl.vertexAttribPointer(
      this._colorLocation,
      this.COLOR_SIZE,
      this.gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * this.ATTRIBUTES_SIZE,
      Float32Array.BYTES_PER_ELEMENT * this.POSITION_SIZE
    )
  }

  get POSITION_SIZE () { return 2 }
  get COLOR_SIZE () { return 1 }
  get ATTRIBUTES_SIZE () { return this.POSITION_SIZE + this.COLOR_SIZE }

  scale ({ width, height }) {
    super.scale({ width, height })

    this.gl.viewport(
      0,
      0,
      this.width * BaseLayer.PIXEL_RATIO,
      this.height * BaseLayer.PIXEL_RATIO
    )
  }

  clear () {
    super.clear()
    this.vertices = []
    this.indices = []
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clearDepth(1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  redraw () {
    super.redraw()

    this.gl.uniform2f(this._resolutionLocation, this.width, this.height)

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      this.gl.DYNAMIC_DRAW
    )

    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices),
      this.gl.DYNAMIC_DRAW
    )

    this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0)
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
  }

  drawRect ({ position, width, height, color, fillColor, strokeWidth = 1 }) {
    this.collectStats('drawRect')

    var offset = this.vertices.length / this.ATTRIBUTES_SIZE

    fillColor = this.getColor(fillColor)

    this.vertices.push(
      position.x,         position.y,          fillColor,
      position.x + width, position.y,          fillColor,
      position.x + width, position.y + height, fillColor,
      position.x,         position.y + height, fillColor
    )

    this.indices.push(
      offset, offset + 1, offset + 2,
      offset, offset + 2, offset + 3
    )
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
