import * as utils from '../utils.js'

export function getContext (canvas) {
  var gl = canvas.getContext('webgl')
  if (!gl) {
    gl = canvas.getContext('experimental-webgl')
  }
  return gl
}

export function compileShader (gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    utils.throwError(`could not compile shader:\r\n${gl.getShaderInfoLog(shader)}`)
  }
  return shader
}

export function createProgram (gl, vertexShader, fragmentShader) {
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    utils.throwError(`program failed to link:\r\n${gl.getProgramInfoLog(program)}`)
  }
  return program
}

function parseHexColor (color) {
  return parseInt(color.replace('#', ''), 16)
}

function parseRgbColor (color) {
  color = color.match(/\d+\.?\d*/g)

  var r = Number(color[0])
  var g = Number(color[1])
  var b = Number(color[2])

  return (r << 16) + (g << 8) + b
}

var colorCache = {}
var cacheLength = 0
var MAX_CACHE_LENGTH = 64

export function parseColor (color) {
  var result

  if (colorCache[color]) {
    return colorCache[color]
  }

  if (color[0] === '#') {
    result = parseHexColor(color)
  } else if (color[0] === 'r') {
    result = parseRgbColor(color)
  } else {
    utils.throwError(`Wrong color format: ${color}`)
  }

  if (cacheLength < MAX_CACHE_LENGTH) {
    colorCache[color] = result
    cacheLength++
  }

  return result
}
