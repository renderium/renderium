class ByteStore {
  constructor (size) {
    this.offset = 0
    this.alloc(size, [])
  }

  alloc (size, data = []) {
    this.size = size
    this.array = new Uint8Array(size)
    this.buffer = this.array.buffer
    this.array.set(data)
  }

  clear () {
    this.offset = 0
  }

  toArray () {
    return this.array.subarray(0, this.offset)
  }

  pushByte (value) {
    this.array[this.offset] = value
    this.offset += 1
  }

  pushShort (value) {
    var a = value & 0xff
    var b = (value - a) / 256
    this.pushByte(b)
    this.pushByte(a)
  }

  pushUShort (value) {
    var a = (value >> 8) & 255
    var b = value & 255
    this.pushByte(a)
    this.pushByte(b)
  }
}

export default ByteStore
