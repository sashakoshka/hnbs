"use strict"

const hnbs = require("../index.js")

let input = new hnbs.StrDict({
  arrayTest: new hnbs.List([
    hnbs.UInt16(324),
    new hnbs.Double(2.234),
    hnbs.Int8(-32),
    hnbs.UInt8(2),
    new hnbs.Str("a\nstring"),
    new hnbs.Str("another string"),
    hnbs.UInt8(0),
    hnbs.Int32(-23500003),
    hnbs.UInt64(2938749328473)
  ]),
  numberTest: hnbs.UInt8(43),
  doubleTest: new hnbs.Double(234.23423423)
})

/*let input = new hnbs.List ([
  hnbs.UInt8(234),
  hnbs.Int8(-40),
  hnbs.UInt16(234534534),
  hnbs.Int16(-234234)
])*/

/*let input = {
  arrayTest: [
    324,
    2.234,
    -32,
    2,
    "a\nstring",
    "another string",
    0,
    -23500003,
    2938749328473
  ],
  number: 43,
  double: 234.23423423
}*/

console.log(JSON.stringify(input))

let binary = input.encode()
console.log(binary.toString('hex').match(/../g).join(' '))

//let output = hnbs.decode(binary)
//console.log(output)
