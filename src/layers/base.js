import ImageLoader from '../loaders/image.js'
import Scheduler from '../scheduler.js'
import Component from '../component.js'
import { throwError } from '../utils/error.js'

class BaseLayer {
  constructor ({ Vector, logger, verbose, width, height }) {
    this.Vector = Vector || window.Vector
    this.logger = logger
    this.verbose = Boolean(verbose)
    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT

    this.canvas = document.createElement('canvas')

    this.imageLoader = new ImageLoader()
    this.scheduler = new Scheduler({
      redraw: false,
      drawComponents: false
    })

    this.components = []
    this.stats = {}
  }

  scale ({ width, height }) {
    if (this.shouldDrawComponents()) {
      throwError('Layer#scale() is forbidden during render cycle')
    }

    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT

    this.canvas.width = this.width
    this.canvas.height = this.height

    if (window.devicePixelRatio) {
      this.canvas.width = this.width * BaseLayer.PIXEL_RATIO
      this.canvas.height = this.height * BaseLayer.PIXEL_RATIO
    }

    this.applyStyles()

    this.planRedraw()

    this.log('width', this.width)
    this.log('height', this.height)
  }

  applyStyles () {
    if (this.shouldDrawComponents()) {
      throwError('Layer#applyStyles() is forbidden during render cycle')
    }

    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = 0
    this.canvas.style.left = 0
    this.canvas.style.right = 0
    this.canvas.style.bottom = 0
  }

  clear () {
    if (this.shouldDrawComponents()) {
      throwError('Layer#clear() is forbidden during render cycle')
    }

    this.clearStats()
  }

  redraw (time, delta) {
    if (this.shouldDrawComponents()) {
      throwError('Layer#redraw() is forbidden during render cycle')
    }

    this.log('components', this.components.length)
    this.log('delta', delta)
    this.log('fps', (1000 / delta) | 0)

    this.planDrawComponents()
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i]
      if (component.shouldRedraw() || this.scheduler.should('redraw')) {
        component.plot(this, time, delta)
      }
      component.draw(this, time, delta)
    }
    this.completeDrawComponents()
    this.completeRedraw()
  }

  forceRedraw () {
    this.planRedraw()
  }

  planRedraw () {
    this.scheduler.plan('redraw')
  }

  completeRedraw () {
    this.scheduler.complete('redraw')
  }

  shouldRedraw () {
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i]
      if (component.shouldRedraw()) {
        return true
      }
    }
    return this.scheduler.should('redraw')
  }

  planDrawComponents () {
    this.scheduler.plan('drawComponents')
  }

  completeDrawComponents () {
    this.scheduler.complete('drawComponents')
  }

  shouldDrawComponents () {
    return this.scheduler.should('drawComponents')
  }

  addComponent (component) {
    if (this.shouldDrawComponents()) {
      throwError('Layer#addComponent() is forbidden during render cycle')
    }

    var idx = this.components.indexOf(component)
    if (idx !== -1) {
      throwError(`Component ${component.constructor.name} has already been added to layer`)
    }
    if (!Component.isComponent(component)) {
      throwError(`Component ${component.constructor.name} has not implemented Component interface`)
    }
    this.components.push(component)
    this.planRedraw()
    component.onadd(this)
  }

  addComponents (components) {
    components.forEach(this.addComponent, this)
  }

  removeComponent (component) {
    if (this.shouldDrawComponents()) {
      throwError('Layer#removeComponent() is forbidden during render cycle')
    }

    var idx = this.components.indexOf(component)
    if (idx !== -1) {
      this.components.splice(idx, 1)
      this.planRedraw()
    }
    component.onremove(this)
  }

  removeComponents (components) {
    components.forEach(this.removeComponent, this)
  }

  clearComponents () {
    if (this.shouldDrawComponents()) {
      throwError('Layer#clearComponents() is forbidden during render cycle')
    }

    this.components = []
    this.planRedraw()
  }

  clearStats () {
    if (this.shouldDrawComponents()) {
      throwError('Layer#clearStats() is forbidden during render cycle')
    }

    for (var methodName in this.stats) {
      this.stats[methodName] = 0
    }
  }

  collectStats (methodName) {
    this.stats[methodName] = (this.stats[methodName] | 0) + 1
  }

  log (name, value) {
    if (this.verbose && this.logger) this.logger.log(name, value)
  }

  printStats () {
    if (this.verbose) {
      for (var i in this.stats) {
        this.log(i, this.stats[i])
      }
    }
  }
}

BaseLayer.PIXEL_RATIO = window.devicePixelRatio || 1
BaseLayer.DEFAULT_WIDTH = 100
BaseLayer.DEFAULT_HEIGHT = 100

export default BaseLayer
