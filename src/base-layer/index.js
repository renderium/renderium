import leftPad from 'left-pad'
import ImageLoader from './image-loader.js'

class BaseLayer {
  constructor ({ Vector, stats, width, height }) {
    this.Vector = Vector || window.Vector
    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT
    this.logStats = Boolean(stats)

    this.canvas = document.createElement('canvas')

    this.imageLoader = new ImageLoader()

    this.components = []
    this.stats = {}
    this._shouldRedraw = false
  }

  scale ({ width, height }) {
    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT

    this.canvas.removeAttribute('width')
    this.canvas.removeAttribute('height')
    this.canvas.removeAttribute('style')

    this.canvas.width = this.width
    this.canvas.height = this.height

    this.applyStyles()

    this.forceRedraw()
  }

  applyStyles () {
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = 0
    this.canvas.style.left = 0
    this.canvas.style.right = 0
    this.canvas.style.bottom = 0
  }

  clear () {
    this.clearStats()
  }

  redraw () {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i]
      component.plot(this)
      component.draw(this)
    }
    this._shouldRedraw = false
  }

  forceRedraw () {
    this._shouldRedraw = true
  }

  shouldRedraw () {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i]
      if (component.shouldRedraw()) {
        return true
      }
    }
    return this._shouldRedraw
  }

  addComponent (component) {
    var idx = this.components.indexOf(component)
    if (idx !== -1) {
      throw new Error(`component ${component.constructor.name} has already been added to layer`)
    }
    if (typeof component.plot !== 'function' || typeof component.draw !== 'function' || typeof component.shouldRedraw !== 'function') {
      throw new Error(`component ${component.constructor.name} has not implemented Component interface`)
    }
    this.components.push(component)
    this.forceRedraw()
  }

  addComponents (components) {
    components.forEach(this.addComponent, this)
  }

  removeComponent (component) {
    var idx = this.components.indexOf(component)
    if (idx !== -1) {
      this.components.splice(idx, 1)
      this.forceRedraw()
    }
  }

  removeComponents (components) {
    components.forEach(this.removeComponent, this)
  }

  clearComponents () {
    this.components = []
    this.forceRedraw()
  }

  clearStats () {
    for (var methodName in this.stats) {
      this.stats[methodName] = 0
    }
  }

  collectStats (methodName) {
    this.stats[methodName]++
  }

  formatStats () {
    var result = []
    var maxStringLength = 20

    for (var methodName in this.stats) {
      result.push(methodName + leftPad(this.stats[methodName], maxStringLength - methodName.length))
    }

    return result
  }
}

BaseLayer.DEFAULT_WIDTH = 100
BaseLayer.DEFAULT_HEIGHT = 100

export default BaseLayer
