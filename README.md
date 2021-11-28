# hnbs
Holanet network binary structure

Format for sending quickly parsable structured data over the network. Somewhat
similar to the NBT format, except far more minimal, and with a greater
structural similarity to that of JSON. All data is encoded as big-endian. The
format is optimized for small size and parsing speed.

Throughout this document, any data prefixed by a type code will be referred to
as a "tag".

## Tag Types

| Hex | Code | Name    | Meaning                            | 
| :-: | :--: | :------ | :------                            |
| x00 | 0    | null    | null                               |
| x01 | 1    | List    | length prefixed list               |
| x02 | 2    | IntDict | length prefixed integer keyed dict |
| x03 | 3    | StrDict | length prefixed string keyed dict  |
|     |      |         |                                    |
| x40 | 64   | Buff    | size prefixed buffer               |
| x41 | 65   | Str     | null terminated string             |
|     |      |         |                                    |
| x80 | 128  | UInt8   | unsigned 8 bit integer             |
| x81 | 129  | Int8    | signed 8 bit integer               |
| x82 | 130  | UInt16  | unsigned 16 bit integer            |
| x83 | 131  | Int16   | signed 16 bit integer              |
| x84 | 132  | UInt32  | unsigned 32 bit integer            |
| x85 | 133  | Int32   | signed 32 bit integer              |
| x86 | 134  | UInt64  | unsigned 64 bit integer            |
| x87 | 135  | Int64   | signed 64 bit integer              |
|     |      |         |                                    |
| xC0 | 192  | Double  | double                             |

## Useful Info

When something is length or size prefixed, the size is an unsigned 32 bit
integer that is in between the code and the data. String keyed dicts can only
have null terminated strings as their keys. String keyed dicts also guard twice
the amount of tags as their length, as the first of each pair is a key. However,
string key objects should not be prefixed with a type code.

Unlike string keyed dicts, integer keyed dicts prefix every value with a signed
32 bit integer key.

If a parser expects a type code, and receives a 0 (null), it should ignore it
and move on to the next tag.

## Format Explanation

```
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
  doubleTest: new hnbs.Double(234.23423423)
})

return input.encode()
```

The above code example produces this binary output:

![Color coded binary output](documentation/binary%20analysis.svg)

Type codes are shown in blue, lengths in purple, strings and string keys in
green, null terminators in orange, and integer/double values in black.
