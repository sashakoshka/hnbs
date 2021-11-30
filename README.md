# hnbs
Holanet network binary structure

A word of warning: this is intentionally untested for versions of NodeJS less
than 14. This is because I am mad at the Debian maintainers for shipping an
extremely out of date version of Node. If you're going to use this module for
some reason and your distribution offers an archaic Node version, you can use
NVM or something. Or install Alpine, the best Linux distribution. 

HNBS is a format for sending quickly parsable structured data over the network.
It is somewhat similar to the NBT format, except far more minimal, and with a
greater structural similarity to that of JSON.  This format is optimized for
small size and parsing speed. All data is encoded as big-endian.

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

## This Node Module

This repository's main purpose is for the hnbs NodeJS module, which can be
installed in your project by navigating to its directory and running:

`npm istall @hlhv/hnbs`

The module will give you these things:

### Module Exports

#### All Tag Classes:

All classes representing tags have a `type` member which allows you to easily
determine what sort of thing it is, especially with generalized classes such as
`Dict` and `Int`.

They also all have a member function called `encode`. This recursively encodes
the tag into binary data and returns it in a `Buffer` object. The output of any
one of these functions is a valid, standalone HNBS object, and can be
transmitted or stored as-is.

#### List

`new List([data])`

An object representing the `List` tag. Lists have a `data` member, which is just
an array containing its child objects. You can pass an array of objects to the
constructor to set it as its data. Be aware, however, that if you try to encode
a `List` that contains things which are not valid tags, an error will be thrown.
This also goes for all types of Dict.

#### Dict

`new Dict(type[, data])`

A class that is able to represent an IntDict, and a StrDict. To find out which
it is, there is a handy type member you can check. It has a `data` member which
is one marvelous JavaScript curly brace object that is either keyed by integers,
or by strings. You can pass one of these to the constructor to set it as its
data member. Be aware that if your keys don't match the `Dict`'s type, (such as
having one or more integer keys in a `StrDict`), you will get an error if you
try encoding the object.

#### IntDict

`new IntDict([data])`

A wrapper around `Dict` that literally just constructs a `Dict` of type
`IntDict`. The only difference is its constructor doesn't need a type code.

#### StrDict

`new StrDict([data])`

See `IntDict`. Just pretend it's talking about strings instead of ints.

#### Buff

`new Buff([data])`

Represents a buffer tag. Has a `data` member which consists of a `Buffer`
object. You may pass a `Buffer` object in to the constructor to set it as the
data.

#### Str

`new Str([data])`

Pretty much the same as as `Buff`, but instead of a `Buffer` it's a string.
However, unlike `Buff`, `Str` is not prefixed by length, but it is terminated by
a null character.
