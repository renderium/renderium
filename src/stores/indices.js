import ByteStore from './byte.js'

class IndicesStore extends ByteStore {
  constructor (size, gl) {
    super(size)
    this.gl = gl
    this.componentSize = this.getComponentSize()
    this.bufferData()
  }

  getComponentSize () {
    return Uint16Array.BYTES_PER_ELEMENT
  }

  bufferData () {
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer, this.gl.DYNAMIC_DRAW)
  }

  shouldAlloc () {
    return this.offset + this.componentSize > this.size
  }

  push (index) {
    if (this.shouldAlloc()) {
      this.alloc(this.size * 2, this.array)
      this.bufferData()
    }
    this.pushUShort(index)
  }
}

export default IndicesStore
