"use strict"

const hnbs = require("../index.js")

let input = new hnbs.StrDict({
  arrayTest: new hnbs.List([
    new hnbs.UInt16(324),
    new hnbs.Double(2.234),
    new hnbs.Int8(-32),
    new hnbs.UInt8(2),
    new hnbs.Str("a\nstring"),
    new hnbs.Str("another string"),
    new hnbs.UInt8(0),
    new hnbs.Int32(-23500003),
    new hnbs.UInt64(2938749328473)
  ]),
  numberTest: new hnbs.UInt8(43),
  doubleTest: new hnbs.Double(234.23423423),
  intDictTest: new hnbs.IntDict ({
     4: new hnbs.Str("number four"),
    23: new hnbs.Str("it is twenty three")
  })
})

console.log(JSON.stringify(input))

let binary = input.encode()
console.log(binary.toString('hex').match(/../g).join(' '))

let output
[output, binary] = hnbs.decode(binary)
console.log(JSON.stringify(output))
