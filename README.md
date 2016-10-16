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

- Autoresizing
- [Image loading](https://github.com/broadsw0rd/renderium#drawimageoptions)
- [Redraw Policy](#redraw-policy)
- Logs
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
- [Drawing arcs](http://codepen.io/broadsw0rd/pen/amyjmZ)
- [Drawing circles](http://codepen.io/broadsw0rd/pen/xEXNkP)
- [Drawing images](http://codepen.io/broadsw0rd/pen/zKPOKd)
- [Drawing polygons](http://codepen.io/broadsw0rd/pen/NRBJpB)
- [Drawing polylines](http://codepen.io/broadsw0rd/pen/amjrKN)
- [Drawing rectangles](http://codepen.io/broadsw0rd/pen/VKGZRq)
- [Drawing text](http://codepen.io/broadsw0rd/pen/ozPbRa)
- [Drawing text with different alignments](http://codepen.io/broadsw0rd/pen/LRkoqJ)

## API

### `Renderium`

#### `.digest()`

#### `.spawn(renderer)`

#### `.kill(renderer)`

#### `#constructor(options)`

#### `#addLayer(layer)`

#### `#removeLayer(layer)`

### `Renderium.Layer`

#### `#constructor(options)`

#### `#addComponent()`

#### `#removeComponent()`

#### `#createGradient(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `start` | `Vector`  |  |
| `end` | `Vector` |  |
| `from` | `String` |  |
| `to` | `String` |  |

Create gradient, based on [this](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient) behaviour, and then used like common color

```js
var gradient = layer.createGradient({
  start: new Renderium.Vector(0, 75),
  end: new Renderium.Vector(0, 125),
  from: '#03a9f4',
  to: '#3f51b5'
})
```

#### `#drawArc(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `radius` | `Number` |  |
| `startAngle` | `Number` |  |
| `endAngle` | `Number` |  |
| `color` | `String|Gradient` |  |
| `width` | `Number` | `1` |

Draw simple arc, based on [this](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc) behaviour

```js
layer.drawArc({
  position: new Renderium.Vector(300, 100),
  color: '#4caf50',
  radius: 25,
  startAngle: Math.PI,
  endAngle: Math.PI / 2,
  width: 2
})
```

Check [examples](http://codepen.io/broadsw0rd/pen/amyjmZ)

#### `#drawCircle(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `radius` | `Number` |  |
| `color` | `String|Gradient` |  |
| `fillColor` | `String|Gradient` |  |
| `width` | `Number` | `1` |

Draw simple circle, based on [this](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc) behaviour

```js
layer.drawCircle({
  position: new Renderium.Vector(300, 100),
  color: '#2196f3',
  fillColor: '#2196f3',
  radius: 25
})
```

Check [examples](http://codepen.io/broadsw0rd/pen/xEXNkP)

#### `#drawImage(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `image` | `Image|String` | |
| `width` | `Number` | `image.width` |
| `height` | `Number` | `image.height` |
| `opacity` | `Number` | `1` |

Draw simple image, if you pass url instead of image instance, it will be loaded first, and then reused

```js
layer.drawImage({
  position: new Renderium.Vector(350, 100),
  image: 'https://upload.wikimedia.org/wikipedia/en/2/24/Lenna.png',
  width: 256,
  height: 256,
  opacity: 1
})
```

Check [examples](http://codepen.io/broadsw0rd/pen/zKPOKd)

#### `#drawPolygon(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `points` | `Array<Vector>` |  |
| `color` | `String|Gradient` |  |
| `fillColor` | `String|Gradient` |  |
| `width` | `Number` | `1` |

Draw polygon. `points` is vertices of polygon

```js
layer.drawPolygon({
  points: [
    new Renderium.Vector(50, 50),
    new Renderium.Vector(100, 50),
    new Renderium.Vector(75, 75)
  ],
  color: '#2196f3',
  fillColor: '#2196f3',
  width: 2
})
```

Check [examples](http://codepen.io/broadsw0rd/pen/NRBJpB)

#### `#drawPolyline(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `points` | `Array<Vector>` |  |
| `color` | `String|Gradient` |  |
| `lineDash` | `Array<Number>` | `[]` |
| `width` | `Number` | `1` |

Draw polyline. `points` is vertices of polyline

```js
layer.drawPolyline({
  points: [
    new Renderium.Vector(50, 50),
    new Renderium.Vector(100, 50),
    new Renderium.Vector(75, 75)
  ],
  color: '#2196f3',
  lineDash: [2, 2],
  width: 2
})
```

Check [examples](http://codepen.io/broadsw0rd/pen/amjrKN)

#### `#drawRect(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `width` | `Number` |  |
| `height` | `Number` |  |
| `color` | `String|Gradient` |  |
| `fillColor` | `String|Gradient` |  |
| `strokeWidth` | `Number` | `1` |

Draw rectangle. `position` is a center of rectangle

```js
layer.drawRect({
  position: new Renderium.Vector(300, 100),
  color: '#2196f3',
  fillColor: '#2196f3',
  width: 100,
  height: 50,
  strokeWidth: 2
})
```

Check [examples](http://codepen.io/broadsw0rd/pen/VKGZRq)

#### `#drawText(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `position` | `Vector`  |  |
| `text` | `String` |  |
| `color` | `String|Gradient` |  |
| `font` | `String` |  |
| `size` | `Number` |  |
| `align` | `String` | `'center'` |
| `baseline` | `String` | `'middle'` |

Draw text

```js
layer.drawText({
  position: new Renderium.Vector(300, 100),
  text: 'Sample text',
  color: '#2196f3',
  font: 'sans-serif',
  size: 16
})
```

Check [examples](http://codepen.io/broadsw0rd/pen/ozPbRa) and [different alignments](http://codepen.io/broadsw0rd/pen/LRkoqJ)

#### `#measureText(options)`

**options**

| Name  | Type | Default |
| ---- | ---- | ---- |
| `text` | `String` |  |
| `font` | `String` |  |
| `size` | `Number` |  |

Returns only text width, based on [this](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText) behaviour. Because there is no [adequate method](http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas) to measure text height and different browsers render text [differently](http://codepen.io/broadsw0rd/pen/LRkoqJ)

```js
var textWidth = layer.measureText({
  text: 'Sample text',
  font: 'Helvetica',
  size: 24
})
```

## Redraw Policy

## Development

Command | Description
------- | -----------
`npm run check` | Check standard code style by [snazzy](https://www.npmjs.com/package/snazzy)
`npm run build` | Wrap source code in [UMD](https://github.com/umdjs/umd) by [rollup](http://rollupjs.org/)
`npm run min` | Minify code by [UglifyJS](https://github.com/mishoo/UglifyJS)
