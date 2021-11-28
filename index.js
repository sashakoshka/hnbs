"use strict"

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
  #type = 1

  constructor (data = []) {
    this.data = data
  }

  encode () {
    let buf = Buffer.alloc(5)
    buf.writeUInt8(this.#type)
    buf.writeUInt32BE(this.data.length, 1)

    for (const item of this.data) {
      try {
        //valTag(item) TODO: fix
      } catch (err) {
        throw "cannot encode List: " + err + ` - type is ${item.type}`
      }
      buf = Buffer.concat([buf, item.encode()])
    }
    
    return buf
  }
  
  get type () { return this.#type }
}

class Dict {
  data
  #type

  constructor (type = 2, data = {}) {
    if (type < 2 || type > 3) throw `invalid type ${type} for dict`
    this.data  = data
    this.#type = type
  }

  encode () {
    let buf = Buffer.alloc(5)
    buf.writeUInt8(this.#type)
    let len = 0

    for (const key in this.data) {
      if (
        (this.#type == 2 && isNaN(key)) ||
        (this.#type == 3 && !isNaN(key))
      ) {
        throw `invalid Dict key "${key}" (type ${typeof key}), expected ` +
              ((this.type == 2) ? "an integer" : "a string")
      }
      let keyBuf
      if (this.#type == 2) {
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
  
  get type () { return this.#type }
}

function IntDict (data) {
  return new Dict(2, data)
}

function StrDict (data) {
  return new Dict(3, data)
}

// stores a size prefixed buffer
class Buff {
  data
  #type = 64

  constructor (data = Buffer.alloc(0)) {
    this.data = data
  }
  
  encode () {
    let buf = Buffer.alloc(5)
    buf.writeUInt8BE(this.#type)
    buf.writeUInt32BE(this.data.length, 1)
    return Buffer.concat([buf, this.data])
  }

  get type () { return this.#type }
}

// stores a null terminated string
class Str {
  data
  #type = 65

  constructor (data = "") {
    this.data = data
  }
  
  encode () {
    let buf = Buffer.alloc(this.data.length + 2)
    buf.writeUInt8(this.#type)
    buf.write(this.data, 1, "utf-8") // last char will be null, perfect!
    return buf
  }

  get type () { return this.#type }
}

// stores a signed or unsigned integer
// i need to redo this at somepoint.
class Int {
  #value
  #type

  constructor (type = 128, value = 0) {
    if (type < 128 || type > 133) throw `invalid type ${type} for Int`
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
  
  get type  () { return this.#type }
  get value () { return this.#value[0] }
  set value (value) { this.#value[0] = value }
}

class LongInt {
  #value
  #type

  constructor (type = 134, value = 0) {
    if (type < 134 || type > 135) throw `invalid type ${type} for LongInt`
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
  
  get type  () { return this.#type }
  get value () { return this.#value }
  set value (value) {
    this.#value[0] = (typeof value == "bigint") ? value : BigInt(value)
  }
}

function UInt8 (value) {
  return new Int(128, value)
}

function Int8 (value) {
  return new Int(129, value)
}

function UInt16 (value) {
  return new Int(130, value)
}

function Int16 (value) {
  return new Int(131, value)
}

function UInt32 (value) {
  return new Int(132, value)
}

function Int32 (value) {
  return new Int(133, value)
}

function UInt64 (value) {
  return new LongInt(134, value)
}

function Int64 (value) {
  return new LongInt(135, value)
}

/* stores a double precision value. unfortunately js only uses floats, so you
   may lose some precision here...
   i might try to mitigate this in the future by using a buffer to store it
   internally and providing some arithmetic member functions */
class Double {
  value
  #type = 192

  constructor (value = 0) {
    this.value = value 
  }
  
  encode () {
    let buf = Buffer.alloc(9)
    buf.writeUInt8(this.#type)
    buf.writeDoubleBE(this.value, 1)
    return buf
  }
  
  get type () { return this.#type }
}

function valTag(tag) {
  if ((tag.kind ?? 256) < 256) return
  throw "value is not a valid tag"
}

function decode (data) {
  let i = 0, obj
  decode_recurse(data, obj, i)
}

function decode_recurse (data, obj, i) {
  
}

module.exports = {
  List    : List,
  Dict    : Dict,
  IntDict : IntDict,
  StrDict : StrDict,

  Buff    : Buff,
  Str     : Str,
  
  Int     : Int,
  UInt8   : UInt8,
  Int8    : Int8,
  UInt16  : UInt16,
  Int16   : Int16,
  UInt32  : UInt32,
  Int32   : Int32,
  UInt64  : UInt64,
  Int64   : Int64,
  
  Double  : Double,
  decode  : decode
}
