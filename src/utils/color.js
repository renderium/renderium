import memoize from 'fast-memoize'
import { throwError } from './error.js'

function parseHexColor (color) {
  color = parseInt(color.slice(1), 16)

  var r = (color >> 16) & 0xff
  var g = (color >> 8) & 0xff
  var b = color & 0xff

  return [r, g, b, 1]
}

function parseRgbColor (color) {
  color = color.match(/\d+\.?\d*/g)

  var r = Number(color[0])
  var g = Number(color[1])
  var b = Number(color[2])
  var a = Number(color[3])

  return [r, g, b, a]
}

function parseColor (color) {
  var result

  if (color[0] === '#') {
    result = parseHexColor(color)
  } else if (color[0] === 'r') {
    result = parseRgbColor(color)
  } else {
    throwError(`Wrong color format: ${color}`)
  }

  return result
}

export var parse = memoize(parseColor)
