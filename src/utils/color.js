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
