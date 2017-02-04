import leftPad from 'left-pad'
import ImageLoader from '../image-loader.js'
import { parseColor } from '../helpers.js'

// -------------------------------------
// WebglLayer
// -------------------------------------

var VSHADER_SOURCE = [
  'attribute vec2 a_position;',
  'attribute vec4 a_color;',
  'varying vec4 v_color;',
  'void main() {',
  '  gl_Position = vec4(a_position, 0, 1);',
  '  v_color = a_color;',
  '}'
].join('\n')

var FSHADER_SOURCE = [
  'precision mediump float;',
  'varying vec4 v_color;',
  'void main() {',
  '  gl_FragColor = v_color;',
  '}'
].join('\n')

function getContext (canvas) {
  var gl = canvas.getContext('webgl')
  if (!gl) {
    gl = canvas.getContext('experimental-webgl')
  }
  return gl
}

function compileShader (gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    throw Error(`could not compile shader:${gl.getShaderInfoLog(shader)}`)
  }
  return shader
}

function createProgram (gl, vertexShader, fragmentShader) {
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    throw Error(`program failed to link:${gl.getProgramInfoLog(program)}`)
  }
  return program
}

class Gradient {
  static isGradient (color) {
    return color && color._isGradient
  }

  constructor ({ start, end, from, to }) {
    this.start = start
    this.end = end
    this.from = parseColor(from)
    this.to = parseColor(to)

    this._isGradient = true
    this._gradient = null
  }

  createGradient (layer) {
    layer.collectStats('createGradient')

    return this.from
  }

  valueOf () {
    return this.from
  }
}

class WebglLayer {
  constructor ({ Vector, stats, width, height }) {
    this.Vector = Vector || window.Vector
    this.logStats = Boolean(stats)
    this.canvas = document.createElement('canvas')
    this.gl = getContext(this.canvas)
    this.scale({
      width: width || WebglLayer.DEFAULT_WIDTH,
      height: height || WebglLayer.DEFAULT_HEIGHT
    })
    this.imageLoader = new ImageLoader()
    this.imageLoader.onload = this.forceRedraw.bind(this)

    this.components = []

    this.positions = []

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

    this._vertexShader = compileShader(this.gl, VSHADER_SOURCE, this.gl.VERTEX_SHADER)
    this._fragmentShader = compileShader(this.gl, FSHADER_SOURCE, this.gl.FRAGMENT_SHADER)

    this._program = createProgram(this.gl, this._vertexShader, this._fragmentShader)
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

  applyStyles () {
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = 0
    this.canvas.style.left = 0
    this.canvas.style.right = 0
    this.canvas.style.bottom = 0
  }

  scale ({ width, height }) {
    this.width = width || WebglLayer.DEFAULT_WIDTH
    this.height = height || WebglLayer.DEFAULT_HEIGHT

    this.canvas.removeAttribute('width')
    this.canvas.removeAttribute('height')
    this.canvas.removeAttribute('style')

    this.gl.canvas.width = this.width
    this.gl.canvas.height = this.height

    this.applyStyles()

    if (window.devicePixelRatio) {
      this.gl.canvas.width = this.width *= window.devicePixelRatio
      this.gl.canvas.height = this.height *= window.devicePixelRatio
    }

    this.gl.viewport(0, 0, this.width, this.height)

    this.forceRedraw()
  }

  clear () {
    this.clearStats()
    this.positions = []
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clearDepth(1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  redraw () {
    for (var i = 0, component; i < this.components.length; i++) {
      component = this.components[i]
      component.plot(this)
      component.draw(this)
    }
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.positions),
      this.gl.STATIC_DRAW
    )
    this.gl.drawArrays(this.gl.LINES, 0, this.positions.length / 6)
    this._shouldRedraw = false
  }

  forceRedraw () {
    this._shouldRedraw = true
  }

  shouldRedraw () {
    for (var i = 0, component; i < this.components.length; i++) {
      component = this.components[i]
      if (component.shouldRedraw()) {
        return true
      }
    }
    return this._shouldRedraw
  }

  addComponent (component) {
    var idx = this.components.indexOf(component)
    if (idx !== -1) {
      throw new Error(`component ${component.constructor.name} has already been added to layer`)
    }
    if (typeof component.plot !== 'function' || typeof component.draw !== 'function' || typeof component.shouldRedraw !== 'function') {
      throw new Error(`component ${component.constructor.name} has not implemented Component interface`)
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
    return Gradient.isGradient(color) ? color.createGradient(this) : parseColor(color)
  }

  drawArea ({ points, threshold, color, fillColor, width = 1 }) {
    this.drawPolyline({
      points,
      color,
      width
    })
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

WebglLayer.DEFAULT_WIDTH = 100
WebglLayer.DEFAULT_HEIGHT = 100

export default WebglLayer
