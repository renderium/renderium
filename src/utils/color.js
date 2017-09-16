import memoize from 'fast-memoize'
import { throwError } from './error.js'

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
