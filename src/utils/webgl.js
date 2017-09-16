import { throwError } from './error.js'

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
    throwError(`Could not compile shader:\r\n${gl.getShaderInfoLog(shader)}`)
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
    throwError(`Program failed to link:\r\n${gl.getProgramInfoLog(program)}`)
  }
  return program
}
