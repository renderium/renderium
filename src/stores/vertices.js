import ByteStore from './byte.js'

class VerticesStore extends ByteStore {
  constructor (size, gl) {
    super(size)
    this.gl = gl
    this.componentSize = this.getComponentSize()
    this.bufferData()
  }

  getComponentSize () {
    return Int16Array.BYTES_PER_ELEMENT * 2 + Uint8Array.BYTES_PER_ELEMENT * 4
  }

  bufferData () {
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.buffer, this.gl.DYNAMIC_DRAW)
  }

  shouldAlloc () {
    return this.offset + this.componentSize > this.size
  }

  push (x, y, r, g, b, a) {
    if (this.shouldAlloc()) {
      this.alloc(this.size * 2, this.array)
      this.bufferData()
    }
    this.pushShort(x)
    this.pushShort(y)
    this.pushByte(r)
    this.pushByte(g)
    this.pushByte(b)
    this.pushByte(a)
  }
}

export default VerticesStore
