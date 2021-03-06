<h1 align="center">Renderium</h1>
<h4 align="center">Superior renderer</h4>

<p align="center">
  <a href="https://www.npmjs.com/package/renderium" target="_blank">
    <img src="https://img.shields.io/npm/v/renderium.svg" alt="NPM version" target="_blank"></img>
  </a>
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
- [Development](#development)

## Features

- Designed with performance in mind
- [Rich API](https://github.com/broadsw0rd/renderium/wiki/API)
- [Components](https://github.com/broadsw0rd/renderium/wiki/Components)
- [Redraw Policy](https://github.com/broadsw0rd/renderium/wiki/Redraw-Policy)
- [Logs](https://github.com/broadsw0rd/renderium/wiki/Logs)

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
import Renderium from 'renderium'
import Vector from 'vectory'

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

export default MyComponent
```

```js
import Renderium from 'renderium'
import Vector from 'vectory'
import MyComponent from './my-component'

// start the digest loop
requestAnimationFrame(function loop (time) {
  Renderium.digest(time)
  requestAnimationFrame(loop)
})

// create the renderer
var renderer = new Renderium({
  el: document.getElementById('root')
})

// spawn it
Renderium.spawn(renderer)

// create a layer
var layer = new Renderium.CanvasLayer({
  Vector
})

// add layer to the renderer
renderer.addLayer(layer)

// create component instance
var component = new MyComponent()

// add component to the layer
layer.addComponent(component)

// enjoy!
```

## [Examples](https://github.com/renderium/examples)

## Development

Command | Description
------- | -----------
`npm run check` | Check standard code style by [snazzy](https://www.npmjs.com/package/snazzy)
`npm run build` | Wrap source code in [UMD](https://github.com/umdjs/umd) by [rollup](http://rollupjs.org/)
`npm run min` | Minify code by [UglifyJS](https://github.com/mishoo/UglifyJS)
