"use strict"

const hnbs = require("../index.js")

let input = {
  bigIntTest: 23n,
  numberTest: 234.325,
  stringTest: "hello world",
  boolTest: true,
  hnbsTest: new hnbs.UInt16(1243),
  listTest: [
    "wow",
    23423,
    true,
    false,
    Buffer.from([0x69, 0x23, 0x10])
  ]
}

let translated = hnbs.fromObj(input)
console.log(translated)
console.log(translated.toObj())
