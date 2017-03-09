class Component {
  onadd (layer) {}
  onremove (layer) {}
  plot (layer) {}
  draw (layer) {}
  shouldRedraw () {
    return false
  }
}

export default Component
