"use strict"

const hnbs = require("../index.js")

let input = new hnbs.StrDict ({
  mthd: new hnbs.UInt8(0),
  head: new hnbs.StrDict({wow: "lol"}),
})

console.log(JSON.stringify(input))

let binary = input.encode()
console.log(binary.toString('hex').match(/../g).join(' '))

let output
[output, binary] = hnbs.decode(binary)
console.log(JSON.stringify(output))
