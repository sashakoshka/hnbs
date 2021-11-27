# hnbs
Holanet network binary structure

| Hex | Code | Meaning                            | 
| :-: | :--: | :------                            |
| x00 | 0    | null                               |
| x01 | 1    | length prefixed list               |
| x02 | 2    | length prefixed integer keyed dict |
| x03 | 3    | length prefixed string keyed dict  |
|     |      |                                    |
| x40 | 64   | size prefixed buffer               |
| x41 | 65   | null terminated string             |
|     |      |                                    |
| x80 | 128  | unsigned 8 bit integer             |
| x81 | 129  | signed 8 bit integer               |
| x82 | 130  | unsigned 16 bit integer            |
| x83 | 131  | signed 16 bit integer              |
| x84 | 132  | unsigned 32 bit integer            |
| x85 | 133  | signed 32 bit integer              |
| x86 | 134  | unsigned 64 bit integer            |
| x87 | 135  | signed 64 bit integer              |
|     |      |                                    |
| xc  | 192  | double                             |

When something is length or size prefixed, the size is an unsigned 32 bit
integer that is in between the code and the data. String keyed dicts can only
have null terminated strings as their keys. String keyed dicts also guard twice
the amount of objects as their length, as the first of each pair is a key.
However, string key objects should not be prefixed with a type code.

Unlike string keyed dicts, integer keyed dicts prefix every value with a signed
32 bit integer key.

If the parser expects a type code, and receives a 0 (null), it should ignore it
and move on to the next item.

All data is big-endian.
