<h1 align="center">Renderium</h1>
<h4 align="center">Canvas and WebGL renderer</h2>

<p align="center">
  <a href="https://www.bithound.io/github/broadsw0rd/renderium">
    <img src="https://www.bithound.io/github/broadsw0rd/renderium/badges/score.svg" alt="bitHound Overall Score">
  </a>
  <a href="https://github.com/feross/standard" target="_blank">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat" alt="js-standard-style"></img>
  </a>
</p>

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
- [Redraw policy](#redraw-policy)
- [Development](#development)

## Features

- [Redraw Policy](#redraw-policy)
- Designed with performance in mind and reviewed with [IRHydra](http://mrale.ph/irhydra/2/)

## Install

Download [dev](https://rawgit.com/broadsw0rd/renderium/master/dist/renderium.js) or [prod](https://rawgit.com/broadsw0rd/renderium/master/dist/renderium.min.js) version and put it in your html

```html
<script src="vendor/renderium.min.js"></script>
```

## Usage

```js
requestAnimationFrame(function loop () {
  Renderium.digest()
  requestAnimationFrame(loop)
})

var renderer = new Renderium({
  el: document.getElementById('root')
})

var layer = new Renderium.CanvasLayer({})

renderer.addLayer(layer)

Renderium.spawn(renderer)
```

## Examples

- **[All](http://codepen.io/collection/AEydae/)**
- [Drawing text with different alignments](http://codepen.io/broadsw0rd/pen/LRkoqJ)

## API

### `Renderium`

#### `.digest()`

#### `.spawn(renderer)`

#### `.kill(renderer)`

#### `#constructor(options)`

#### `#addLayer(layer)`

#### `#removeLayer(layer)`

#### `#scale()`

#### `#clear()`

#### `#redraw()`

### `Renderium.Layer`

#### `#constructor(options)`

#### `#scale(options)`

#### `#clear()`

#### `#redraw()`

#### `#forceRedraw()`

#### `#shouldRedraw()`

#### `#drawArc(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `radius` | `Number` |  |
| `startAngle` | `Number` |  |
| `endAngle` | `Number` |  |
| `color` | `String` |  |
| `width` | `Number` | `1` |

#### `#drawCircle(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `radius` | `Number` |  |
| `color` | `String` |  |
| `fillColor` | `String` |  |
| `width` | `Number` | `1` |

#### `#drawImage(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `image` | `Image|String` | |
| `width` | `Number` | `image.width` |
| `height` | `Number` | `image.height` |
| `opacity` | `Number` | `1` |

#### `#drawPolygon(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `points` | `Array<Vector>` |  |
| `color` | `String` |  |
| `fillColor` | `String` |  |
| `width` | `Number` | `1` |

#### `#drawPolyline(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `points` | `Array<Vector>` |  |
| `color` | `String` |  |
| `lineDash` | `Array<Number>` | `[]` |
| `width` | `Number` | `1` |

#### `#drawRect(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `width` | `Number` |  |
| `height` | `Number` |  |
| `color` | `String` |  |
| `fillColor` | `String` |  |
| `strokeWidth` | `Number` | `1` |

#### `#drawText(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `text` | `String` |  |
| `color` | `String` |  |
| `font` | `String` |  |
| `size` | `Number` |  |
| `align` | `String` | `'center'` |
| `baseline` | `String` | `'middle'` |

#### `#measureText(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `text` | `String` |  |
| `font` | `String` |  |
| `size` | `Number` |  |

## Redraw Policy

## Development

Command | Description
------- | -----------
`npm run check` | Check standard code style by [snazzy](https://www.npmjs.com/package/snazzy)
`npm run build` | Wrap source code in [UMD](https://github.com/umdjs/umd) by [rollup](http://rollupjs.org/)
`npm run min` | Minify code by [UglifyJS](https://github.com/mishoo/UglifyJS)
