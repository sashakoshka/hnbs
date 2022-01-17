"use strict"

const hnbs = require("../index.js")

const reference = Object.freeze (
  new hnbs.List ([
    new hnbs.Str(),
    new hnbs.Str(),
    new hnbs.StrDict ({
      numberTest: new hnbs.UInt8(43),
      doubleTest: new hnbs.Double(234.23423423),
      intDictTest: new hnbs.IntDict ({
         4: new hnbs.Str("number four"),
        23: new hnbs.Str("it is twenty three")
      }),
    })
  ])
)

let obj1 = new hnbs.List ([
  new hnbs.Str(),
  new hnbs.Str(),
  new hnbs.StrDict ({
    numberTest: new hnbs.UInt8(43),
    doubleTest: new hnbs.Double(234.23423423),
    intDictTest: new hnbs.IntDict ({
       4: new hnbs.Str("number four"),
      23: new hnbs.Str("it is twenty three")
    }),
  })
])

let obj2 = new hnbs.List ([
  new hnbs.Str(),
  new hnbs.Int(),
  new hnbs.StrDict ({
    numberTest: new hnbs.UInt8(43),
    doubleTest: new hnbs.Double(234.23423423),
    intDictTest: new hnbs.IntDict ({
       4: new hnbs.Str("number four"),
      23: new hnbs.Str("it is twenty three")
    }),
  })
])

let obj1Result = obj1.test(reference)
let obj2Result = obj2.test(reference)

console.log("... object 1:", obj1Result)
console.log("... object 2:", obj2Result)

if (obj1Result && !obj2Result)
  console.log(".// test passed")
else
  console.log("XXX test failed")
