import BaseLayer from './base.js'
import * as webgl from '../utils/webgl.js'
import { parse as parseColor } from '../utils/color.js'
import vertextShaderSource from '../shaders/vertex.glsl'
import fragmentShaderSource from '../shaders/fragment.glsl'
import IndicesStore from '../stores/indices.js'
import VerticesStore from '../stores/vertices.js'

// -------------------------------------
// WebglLayer
// -------------------------------------

class WebglLayer extends BaseLayer {
  constructor ({ Vector, stats, width, height }) {
    super({ Vector, stats, width, height })

    this.gl = webgl.getContext(this.canvas)

    this.scale({ width, height })

    this.imageLoader.onload = this.forceRedraw.bind(this)

    this._vertexShader = webgl.compileShader(this.gl, vertextShaderSource, this.gl.VERTEX_SHADER)
    this._fragmentShader = webgl.compileShader(this.gl, fragmentShaderSource, this.gl.FRAGMENT_SHADER)

    this._program = webgl.createProgram(this.gl, this._vertexShader, this._fragmentShader)
    this.gl.useProgram(this._program)

    this._resolutionLocation = this.gl.getUniformLocation(this._program, 'u_resolution')
    this._positionLocation = this.gl.getAttribLocation(this._program, 'a_position')
    this._colorLocation = this.gl.getAttribLocation(this._program, 'a_color')
    this._alphaLocation = this.gl.getAttribLocation(this._program, 'a_alpha')

    this._indicesBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer)
    this.indices = new IndicesStore(this.DEFAULT_INDICES_COUNT, this.gl)

    this._verticesBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._verticesBuffer)
    this.vertices = new VerticesStore(this.DEFAULT_VERTICES_COUNT, this.gl)

    this.gl.enableVertexAttribArray(this._positionLocation)
    this.gl.enableVertexAttribArray(this._colorLocation)
    this.gl.enableVertexAttribArray(this._alphaLocation)

    this.gl.vertexAttribPointer(
      this._positionLocation,
      this.POSITION_LENGTH,
      this.gl.SHORT,
      false,
      this.ATTRIBUTES_SIZE,
      0
    )
    this.gl.vertexAttribPointer(
      this._colorLocation,
      this.COLOR_LENGTH,
      this.gl.UNSIGNED_BYTE,
      true,
      this.ATTRIBUTES_SIZE,
      this.POSITION_SIZE
    )
    this.gl.vertexAttribPointer(
      this._alphaLocation,
      this.ALPHA_LENGTH,
      this.gl.UNSIGNED_BYTE,
      true,
      this.ATTRIBUTES_SIZE,
      this.POSITION_SIZE + this.COLOR_SIZE
    )
  }

  get POSITION_LENGTH () {
    return 2
  }
  get POSITION_SIZE () {
    return this.POSITION_LENGTH * Int16Array.BYTES_PER_ELEMENT
  }
  get COLOR_LENGTH () {
    return 3
  }
  get COLOR_SIZE () {
    return this.COLOR_LENGTH * Uint8Array.BYTES_PER_ELEMENT
  }
  get ALPHA_LENGTH () {
    return 1
  }
  get ALPHA_SIZE () {
    return this.ALPHA_LENGTH * Uint8Array.BYTES_PER_ELEMENT
  }
  get ATTRIBUTES_LENGTH () {
    return this.POSITION_LENGTH + this.COLOR_LENGTH + this.ALPHA_LENGTH
  }
  get ATTRIBUTES_SIZE () {
    return this.POSITION_SIZE + this.COLOR_SIZE + this.ALPHA_SIZE
  }
  get DEFAULT_INDICES_COUNT () {
    return 0xff
  }
  get DEFAULT_VERTICES_COUNT () {
    return this.DEFAULT_INDICES_COUNT * this.ATTRIBUTES_LENGTH
  }

  scale ({ width, height }) {
    super.scale({ width, height })

    this.gl.viewport(
      0,
      0,
      this.width * BaseLayer.PIXEL_RATIO,
      this.height * BaseLayer.PIXEL_RATIO
    )
    this.gl.uniform2f(this._resolutionLocation, this.width, this.height)
  }

  clear () {
    super.clear()

    this.indices.clear()
    this.vertices.clear()

    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  redraw () {
    super.redraw()

    this.gl.bufferSubData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      0,
      this.indices.toArray()
    )

    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      0,
      this.vertices.toArray()
    )

    this.gl.drawElements(this.gl.TRIANGLE_SPTRIP, this.indices.offset, this.gl.UNSIGNED_SHORT, 0)
  }

  createGradient ({ start, end, from, to }) {
    return { start, end, from, to }
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
        return 1
      } else {
        return 1
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

  drawRect ({ position, width, height, color, fillColor, strokeWidth = 1, opacity = 1 }) {
    this.collectStats('drawRect')

    var offset = this.vertices.offset / this.ATTRIBUTES_LENGTH

    var [r, g, b, alpha] = this.getColor(fillColor)
    alpha = alpha * opacity * 0xff | 0

    this.vertices.push(position.x, position.y, r, g, b, alpha)
    this.vertices.push(position.x + width, position.y, r, g, b, alpha)
    this.vertices.push(position.x + width, position.y + height, r, g, b, alpha)
    this.vertices.push(position.x, position.y + height, r, g, b, alpha)

    this.indices.push(offset)
    this.indices.push(offset)
    this.indices.push(offset + 1)
    this.indices.push(offset + 2)
    this.indices.push(offset + 3)
    this.indices.push(offset + 3)
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
