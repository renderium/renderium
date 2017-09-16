import BaseLayer from './base.js'
import * as webgl from '../utils/webgl.js'
import { parseColor } from '../utils/color.js'
import vertextShaderSource from '../shaders/vertex.glsl'
import fragmentShaderSource from '../shaders/fragment.glsl'

// -------------------------------------
// WebglLayer
// -------------------------------------

class WebglLayer extends BaseLayer {
  constructor ({ Vector, stats, width, height }) {
    super({ Vector, stats, width, height })

    this.gl = webgl.getContext(this.canvas)

    this.scale({ width, height })

    this.imageLoader.onload = this.forceRedraw.bind(this)

    this.vertices = new Float32Array(this.MAX_VERTICES_COUNT)
    this.indices = new Uint16Array(this.MAX_INDICES_COUNT)

    this.verticesCount = 0
    this.indicesCount = 0

    this._vertexShader = webgl.compileShader(this.gl, vertextShaderSource, this.gl.VERTEX_SHADER)
    this._fragmentShader = webgl.compileShader(this.gl, fragmentShaderSource, this.gl.FRAGMENT_SHADER)

    this._program = webgl.createProgram(this.gl, this._vertexShader, this._fragmentShader)
    this.gl.useProgram(this._program)

    this._resolutionLocation = this.gl.getUniformLocation(this._program, 'u_resolution')
    this._positionLocation = this.gl.getAttribLocation(this._program, 'a_position')
    this._colorLocation = this.gl.getAttribLocation(this._program, 'a_color')

    this._verticesBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._verticesBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.DYNAMIC_DRAW)

    this._indicesBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.DYNAMIC_DRAW)

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
  get MAX_INDICES_COUNT () { return 0xffffff }
  get MAX_VERTICES_COUNT () { return this.MAX_INDICES_COUNT * Math.ceil(this.ATTRIBUTES_SIZE / 3) * 2 }

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

    this.verticesCount = 0
    this.indicesCount = 0

    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clearDepth(1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  redraw () {
    super.redraw()

    this.gl.uniform2f(this._resolutionLocation, this.width, this.height)

    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      0,
      this.vertices.subarray(0, this.verticesCount)
    )

    this.gl.bufferSubData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      0,
      this.indices.subarray(0, this.indicesCount)
    )

    this.gl.drawElements(this.gl.TRIANGLES, this.indicesCount, this.gl.UNSIGNED_SHORT, 0)
  }

  createGradient ({ start, end, from, to }) {
    return new Gradient({ start, end, from, to })
  }

  getColor (color) {
    return parseColor(color)
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

    var offset = this.verticesCount / this.ATTRIBUTES_SIZE

    fillColor = this.getColor(fillColor)

    this.vertices[this.verticesCount++] = position.x
    this.vertices[this.verticesCount++] = position.y
    this.vertices[this.verticesCount++] = fillColor

    this.vertices[this.verticesCount++] = position.x + width
    this.vertices[this.verticesCount++] = position.y
    this.vertices[this.verticesCount++] = fillColor

    this.vertices[this.verticesCount++] = position.x + width
    this.vertices[this.verticesCount++] = position.y + height
    this.vertices[this.verticesCount++] = fillColor

    this.vertices[this.verticesCount++] = position.x
    this.vertices[this.verticesCount++] = position.y + height
    this.vertices[this.verticesCount++] = fillColor

    this.indices[this.indicesCount++] = offset
    this.indices[this.indicesCount++] = offset + 1
    this.indices[this.indicesCount++] = offset + 2

    this.indices[this.indicesCount++] = offset
    this.indices[this.indicesCount++] = offset + 2
    this.indices[this.indicesCount++] = offset + 3
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
