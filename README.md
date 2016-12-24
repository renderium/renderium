<h1 align="center">Renderium</h1>
<h4 align="center">Component based canvas renderer what you missed</h4>

<p align="center">
  <a href="https://www.bithound.io/github/broadsw0rd/renderium">
    <img src="https://www.bithound.io/github/broadsw0rd/renderium/badges/score.svg" alt="bitHound Overall Score"/>
  </a>
  <a href="https://github.com/feross/standard" target="_blank">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat" alt="js-standard-style"/>
  </a>
</p>

## Table of Contents

- [Features](#features)
- [Dependencies](#dependencies)
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

## Dependencies

- [Vectory](https://www.npmjs.com/package/vectory)

## Install

Download [dev](https://rawgit.com/broadsw0rd/renderium/master/dist/renderium.js) or [prod](https://rawgit.com/broadsw0rd/renderium/master/dist/renderium.min.js) version and put it in your html

```html
<script src="vendor/vectory.min.js"></script>
<script src="vendor/renderium.min.js"></script>
```

## Usage

```js
// implement a component
class MyComponent extends Renderium.Component {
  draw (layer) {
    layer.drawRect({
      position: new Vector(10, 10),
      width: 100,
      height: 100,
      color: '#03a9f4'
    })
  }
}
```

```js
// start the digest loop
requestAnimationFrame(function loop () {
  Renderium.digest()
  requestAnimationFrame(loop)
})

// create the renderer
var renderer = new Renderium({
  el: document.getElementById('root')
})

// spawn it
Renderium.spawn(renderer)

// create a layer
var layer = new Renderium.CanvasLayer({})

// add layer to the renderer
renderer.addLayer(layer)

// create component instance
var component = new MyComponent()

// add component to the layer
layer.addComponent(component)

// enjoy!
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
- [Conway's Game of Life](http://codepen.io/broadsw0rd/pen/KgJrLy)

## API

### `Renderium`

#### `.digest()`

Guarantees per frame synchronization of all renderers. Recommended to use [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) or [raf](https://www.npmjs.com/package/raf)

```js
requestAnimationFrame(function loop (t) {
  Renderium.digest()
  requestAnimationFrame(loop)
})
```

#### `.spawn(renderer)`

**Throw errors:**

- if renderer has already been spawned

#### `.kill(renderer)`

#### `#constructor(options)`

#### `#addLayer(layer)`

**Throw errors:**

- if layer has already been added to renderer

#### `#removeLayer(layer)`

### `Renderium.CanvasLayer`

#### `#constructor(options)`

List of useful properties

- `.canvas` - `<canvas/>` element
- `.ctx` - canvas 2d context
- `.width` - layer width
- `.height` - layer height
- `.components` - list of added components

#### `#addComponent()`

**Throw errors:**

- if component has already been added to layer
- if component has not implemented [Component](#renderiumcomponent) interface

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
  start: new Vector(0, 75),
  end: new Vector(0, 125),
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
  position: new Vector(300, 100),
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
  position: new Vector(300, 100),
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

Draw simple image, if you pass url instead of image instance, it will be loaded first, and then reused. `position` is the upper left corner of image

```js
layer.drawImage({
  position: new Vector(350, 100),
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
    new Vector(50, 50),
    new Vector(100, 50),
    new Vector(75, 75)
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
    new Vector(50, 50),
    new Vector(100, 50),
    new Vector(75, 75)
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

Draw rectangle. `position` is the upper left corner of rectangle

```js
layer.drawRect({
  position: new Vector(300, 100),
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
  position: new Vector(300, 100),
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

### `Renderium.Component`

#### `#plot(layer)`

#### `#draw(layer)`

#### `#shouldRedraw()`

## Redraw Policy

## Development

Command | Description
------- | -----------
`npm run check` | Check standard code style by [snazzy](https://www.npmjs.com/package/snazzy)
`npm run build` | Wrap source code in [UMD](https://github.com/umdjs/umd) by [rollup](http://rollupjs.org/)
`npm run min` | Minify code by [UglifyJS](https://github.com/mishoo/UglifyJS)
