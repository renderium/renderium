import leftPad from 'left-pad'
import ImageLoader from '../loaders/image.js'
import Scheduler from '../scheduler.js'
import Component from '../component.js'
import { throwError } from '../utils/error.js'

class BaseLayer {
  constructor ({ Vector, stats, width, height }) {
    this.Vector = Vector || window.Vector
    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT
    this.logStats = Boolean(stats)

    this.canvas = document.createElement('canvas')

    this.imageLoader = new ImageLoader()
    this.scheduler = new Scheduler({
      redraw: false
    })

    this.components = []
    this.stats = {}

    this._renderCycleStarted = false
  }

  scale ({ width, height }) {
    if (this.renderCycleStarted()) {
      throwError('Layer#scale() is forbidden during render cycle')
    }

    this.width = Number(width) || BaseLayer.DEFAULT_WIDTH
    this.height = Number(height) || BaseLayer.DEFAULT_HEIGHT

    this.canvas.width = this.width
    this.canvas.height = this.height

    this.applyStyles()

    this.planRedraw()
  }

  applyStyles () {
    if (this.renderCycleStarted()) {
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
    if (this.renderCycleStarted()) {
      throwError('Layer#clear() is forbidden during render cycle')
    }

    this.clearStats()
  }

  redraw (time) {
    if (this.renderCycleStarted()) {
      throwError('Layer#redraw() is forbidden during render cycle')
    }

    this.startRenderCycle()
    for (var i = 0; i < this.components.length; i++) {
      var component = this.components[i]
      if (component.shouldRedraw() || this.scheduler.should('redraw')) {
        component.plot(this, time)
      }
      component.draw(this, time)
    }
    this.completeRenderCycle()
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

  startRenderCycle () {
    this._renderCycleStarted = true
  }

  completeRenderCycle () {
    this._renderCycleStarted = false
  }

  renderCycleStarted () {
    return this._renderCycleStarted
  }

  addComponent (component) {
    if (this.renderCycleStarted()) {
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
    if (this.renderCycleStarted()) {
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
    if (this.renderCycleStarted()) {
      throwError('Layer#clearComponents() is forbidden during render cycle')
    }

    this.components = []
    this.planRedraw()
  }

  clearStats () {
    if (this.renderCycleStarted()) {
      throwError('Layer#clearStats() is forbidden during render cycle')
    }

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
