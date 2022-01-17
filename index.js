"use strict"

const types = Object.freeze ({
  List    : 0x01,
  IntDict : 0x02,
  StrDict : 0x03,

  Buff    : 0x40,
  Str     : 0x41,

  UInt8   : 0x80,
  Int8    : 0x81,
  UInt16  : 0x82,
  Int16   : 0x83,
  UInt32  : 0x84,
  Int32   : 0x85,
  UInt64  : 0x86,
  Int64   : 0x87,

  Double  : 0xC0
})

// for quickly selecting utilities to process integers with
const intProps = {
//code size writemethod   array type
  128: [1, "writeUInt8",       Uint8Array],
  129: [1, "writeInt8",        Int8Array],
  130: [2, "writeUInt16BE",    Uint16Array],
  131: [2, "writeInt16BE",     Int16Array],
  132: [4, "writeUInt32BE",    Uint32Array],
  133: [4, "writeInt32BE",     Int32Array],
  134: [8, "writeBigUInt64BE", BigUint64Array],
  135: [8, "writeBigInt64BE",  BigInt64Array]
}

class List {
  data
  #type = types.List

  constructor (data = []) {
    this.data = data
  }

  encode () {
    let buf = Buffer.alloc(5)
    buf.writeUInt8(this.#type)
    buf.writeUInt32BE(this.data.length, 1)

    for (const item of this.data) {
      try {
        valTag(item)
      } catch (err) {
        throw "cannot encode List: " + err + ` - type is ${item.type}`
      }
      buf = Buffer.concat([buf, item.encode()])
    }
    
    return buf
  }

  test (reference) {
    if (
      reference?.type  !== this.type ||
      this.data.length <   reference.data.length
    ) return false
    for (let i = 0; i < reference.data.length; i++) {
      if (!this.data[i].test(reference.data[i])) return false
    }
    return true
  }
    
  get type () { return this.#type }
}

class Dict {
  data
  #type

  constructor (type = types.IntDict, data = {}) {
    if (type < types.IntDict || type > types.StrDict)
      throw `invalid type ${type} for dict`
    this.data  = data
    this.#type = type
  }

  encode () {
    let buf = Buffer.alloc(5)
    buf.writeUInt8(this.#type)
    let len = 0

    for (const key in this.data) {
      if (
        (this.#type == types.IntDict && isNaN(key)) ||
        (this.#type == types.StrDict && !isNaN(key))
      ) {
        throw `invalid Dict key "${key}" (type ${typeof key}), expected ` +
              ((this.type == 2) ? "an integer" : "a string")
      }
      let keyBuf
      if (this.#type == types.IntDict) {
        keyBuf = Buffer.alloc(4)
        keyBuf.writeInt32BE(key)
      } else {
        keyBuf = Buffer.alloc(key.length + 1)
        keyBuf.write(key, "utf-8")
      }
      
      buf = Buffer.concat([buf, keyBuf, this.data[key].encode()])
      len ++
    }
    buf.writeUInt32BE(len, 1)
    
    return buf
  }
  
  test (reference) {
    if (
      reference?.type  !== this.type ||
      this.data.length <   reference.data.length
    ) return false
    for (const key in reference.data) {
      if (!reference.data[key])
      if (!this.data[key].test(reference.data[key])) return false
    }
    return true
  }
  
  get type () { return this.#type }
}

function IntDict (data) {
  return new Dict(types.IntDict, data)
}

function StrDict (data) {
  return new Dict(types.StrDict, data)
}

// stores a size prefixed buffer
class Buff {
  data
  #type = types.Buff

  constructor (data = Buffer.alloc(0)) {
    this.data = data
  }
  
  encode () {
    let buf = Buffer.alloc(5)
    buf.writeUInt8(this.#type)
    buf.writeUInt32BE(this.data.length, 1)
    return Buffer.concat([buf, this.data])
  }

  test (reference) { return reference?.type === this.type }

  get type () { return this.#type }
}

// stores a null terminated string
class Str {
  data
  #type = types.Str

  constructor (data = "") {
    this.data = data
  }
  
  encode () {
    let buf = Buffer.alloc(this.data.length + 2)
    buf.writeUInt8(this.#type)
    buf.write(this.data, 1, "utf-8") // last char will be null, perfect!
    return buf
  }
  
  test (reference) { return reference?.type === this.type }

  get type () { return this.#type }
}

// stores a signed or unsigned integer
// i need to redo this at somepoint.
class Int {
  #value
  #type

  constructor (type = types.UInt8, value = 0) {
    if (type < types.UInt8 || type > types.Int32)
      throw `invalid type ${type} for Int`
    this.#type  = type
    this.#value = new (intProps[this.#type][2])([value])
  }
  
  encode () {
    // im so sorry
    let buf = Buffer.alloc(intProps[this.#type][0] + 1)
    buf.writeUInt8(this.#type)
    buf[intProps[this.#type][1]](this.#value[0], 1)
    return buf
  }
  
  test (reference) { return reference?.type === this.type }

  get type  () { return this.#type }
  get value () { return this.#value[0] }
  set value (value) { this.#value[0] = value }
}

class LongInt {
  #value
  #type

  constructor (type = types.UInt64, value = 0) {
    if (type < types.UInt64 || type > types.Int64)
      throw `invalid type ${type} for LongInt`
    this.#type  = type
    this.#value = BigInt(value)
  }
  
  encode () {
    // im so sorry
    let buf = Buffer.alloc(intProps[this.#type][0] + 1)
    buf.writeUInt8(this.#type)
    buf[intProps[this.#type][1]](this.#value, 1)
    return buf
  }

  test (reference) { return reference?.type === this.type }
  
  get type  () { return this.#type }
  get value () { return this.#value }
  set value (value) {
    this.#value[0] = (typeof value == "bigint") ? value : BigInt(value)
  }
}

class UInt8 {
  constructor (value) { return new Int(types.UInt8, value) }
}

class Int8 {
  constructor (value) { return new Int(types.Int8, value) }
}

class UInt16 {
  constructor (value) { return new Int(types.UInt16, value) }
}

class Int16 {
  constructor (value) { return new Int(types.Int16, value) }
}

class UInt32 {
  constructor (value) { return new Int(types.UInt32, value) }
}

class Int32 {
  constructor (value) { return new Int(types.Int32, value) }
}

class UInt64 {
  constructor (value) { return new LongInt(types.UInt64, value) }
}

class Int64 {
  constructor (value) { return new LongInt(types.Int64, value) }
}

/* stores a double precision floating point value. */
class Double {
  value
  #type = types.Double

  constructor (value = 0) {
    this.value = value
  }
  
  encode () {
    let buf = Buffer.alloc(9)
    buf.writeUInt8(this.#type)
    buf.writeDoubleBE(this.value, 1)
    return buf
  }

  test (reference) { return reference?.type === this.type }
  
  get type () { return this.#type }
}

function valTag(tag) {
  if ((tag.type ?? 256) < 256)
    return
  if (tag.type !== undefined) throw `type code ${tag.type} is unrecognized`
  throw "input is not a valid tag"
}

const classDict = {
  0x01 : List,
  0x02 : IntDict,
  0x03 : StrDict,

  0x40 : Buff,
  0x41 : Str,

  0x80 : UInt8,
  0x81 : Int8,
  0x82 : UInt16,
  0x83 : Int16,
  0x84 : UInt32,
  0x85 : Int32,
  0x86 : UInt64,
  0x87 : Int64,

  0xC0 : Double
}

// call function with:
// let [obj, buf] = decode(buf)
function decode (data) {
  let obj, i = 0, code = data[0]
  data = data.slice(1)

  switch (code) {
    case 0: return null

    case types.List: {
      let size = data.readInt32BE()
      data = data.slice(4)
      let items = []
      let item

      while (size --> 0) {
        [item, data] = decode(data)
        if (item) items.push(item)
      }

      return [new List(items), data]
    }
    
    case types.IntDict: {
      let size = data.readInt32BE()
      data = data.slice(4)
      let items = {}
      let item

      while (size --> 0) {
        let key = data.readInt32BE()
        let res = decode(data.slice(4))
        item = res[0]
        data = res[1]
        if (item) items[key] = item
      }

      return [new IntDict(items), data]
    }

    case types.StrDict: {
      let size = data.readInt32BE()
      data = data.slice(4)
      let items = {}
      let item

      while (size --> 0) {
        let len = data.indexOf(0)
        let key = data.slice(0, len).toString("utf-8")

        let res = decode(data.slice(len + 1))
        item = res[0]
        data = res[1]
        if (item) items[key] = item
      }

      return [new StrDict(items), data]
    }
    
    case types.Buff: {
      let size = data.readInt32BE()
      let buf = Buffer.alloc(size)
      data.copy(buf, 0, 4, size + 4)
      return [new Buff(buf), data.slice(size)]
    }
    
    case types.Str: {
      let len = data.indexOf(0)
      let str = data.slice(0, len).toString("utf-8")
      return [new Str(str), data.slice(len + 1)]
    }

    case types.UInt8:  return [new Int(code, data.readUInt8()),    data.slice(1)]
    case types.Int8:   return [new Int(code, data.readInt8()),     data.slice(1)]
    case types.UInt16: return [new Int(code, data.readUInt16BE()), data.slice(2)]
    case types.Int16:  return [new Int(code, data.readInt16BE()),  data.slice(2)]
    case types.UInt32: return [new Int(code, data.readUInt32BE()), data.slice(4)]
    case types.Int32:  return [new Int(code, data.readInt32BE()),  data.slice(4)]
    case types.UInt64: return [
                        new LongInt(code, data.readBigUInt64BE()),
                        data.slice(8)
                      ]
    case types.Int64:  return [
                        new LongInt(code, data.readBigInt64BE()),
                        data.slice(8)
                      ]
    
    case types.Double: return [new Double(data.readDoubleBE(0)), data.slice(8)]

    default: throw `type code ${code} is unrecognized`
  }
}

module.exports = {
  List    : List,
  Dict    : Dict,
  IntDict : IntDict,
  StrDict : StrDict,

  Buff    : Buff,
  Str     : Str,
  
  Int     : Int,
  LongInt : LongInt,
  UInt8   : UInt8,
  Int8    : Int8,
  UInt16  : UInt16,
  Int16   : Int16,
  UInt32  : UInt32,
  Int32   : Int32,
  UInt64  : UInt64,
  Int64   : Int64,
  
  Double  : Double,
  
  decode  : decode,
  types   : types
}
