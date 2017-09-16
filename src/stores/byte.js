class ByteStore {
  constructor (size) {
    this.offset = 0
    this.alloc(size, [])
  }

  alloc (size, data = []) {
    this.size = size
    this.array = new Uint8Array(size)
    this.buffer = this.array.buffer
    this.view = new DataView(this.buffer)
    this.array.set(data)
  }

  clear () {
    this.offset = 0
  }

  toArray () {
    return this.array.subarray(0, this.offset)
  }

  pushByte (value) {
    this.view.setUint8(this.offset, value)
    this.offset += 1
  }

  pushShort (value) {
    this.view.setInt16(this.offset, value)
    this.offset += 2
  }

  pushUShort (value) {
    this.view.setUint16(this.offset, value)
    this.offset += 2
  }
}

export default ByteStore
