import CanvasLayer from './canvas-layer.js'
import Component from './component.js'
import colors from './colors.js'

class Renderium {
  static spawn (renderer) {
    var idx = Renderium.instances.indexOf(renderer)
    if (idx !== -1) {
      throw new Error('renderer has already been spawned')
    }
    Renderium.instances.push(renderer)
  }

  static kill (renderer) {
    var idx = Renderium.instances.indexOf(renderer)
    if (idx !== -1) {
      Renderium.instances.splice(idx, 1)
    }
  }

  static digest () {
    for (var i = 0; i < Renderium.instances.length; i++) {
      var renderer = Renderium.instances[i]
      renderer.clear()
      renderer.scale()
      renderer.redraw()
    }
  }

  constructor ({ el }) {
    this.el = el
    this.el.style.position = 'relative'
    this.el.style.width = '100%'
    this.el.style.height = '100%'
    this.width = this.el.clientWidth
    this.height = this.el.clientHeight
    this.layers = []
  }

  addLayer (layer) {
    var idx = this.layers.indexOf(layer)
    if (idx !== -1) {
      throw new Error('layer has already been added to renderer')
    }
    this.layers.push(layer)
    this.el.appendChild(layer.canvas)
    layer.scale({ width: this.width, height: this.height })
  }

  removeLayer (layer) {
    var idx = this.layers.indexOf(layer)
    if (idx !== -1) {
      this.layers.splice(idx, 1)
      this.el.removeChild(layer.canvas)
    }
  }

  scale () {
    var width = this.el.clientWidth
    var height = this.el.clientHeight

    if (width !== this.width || height !== this.height) {
      for (var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i]
        layer.scale({ width, height })
      }
      this.width = width
      this.height = height
    }
  }

  clear () {
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i]
      if (layer.shouldRedraw()) {
        layer.clear()
      }
    }
  }

  redraw () {
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i]
      if (layer.shouldRedraw()) {
        layer.redraw()
      }
    }
  }
}

Renderium.instances = []

Renderium.CanvasLayer = CanvasLayer
Renderium.Component = Component
Renderium.colors = colors

export default Renderium
