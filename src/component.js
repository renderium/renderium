class Component {
  static isComponent (component) {
    return (
      typeof component.plot === 'function' &&
      typeof component.draw === 'function' &&
      typeof component.shouldRedraw === 'function' &&
      typeof component.onadd === 'function' &&
      typeof component.onremove === 'function'
    )
  }
  onadd (layer) {}
  onremove (layer) {}
  plot (layer) {}
  draw (layer) {}
  shouldRedraw () {
    return true
  }
}

export default Component
