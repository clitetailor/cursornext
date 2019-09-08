<h1 align="center">
  <b>cursor><i style="color: hsl(200, 100%, 50%)">next</i><b>
</h1>

<p align="center">
  <b>
    A minimalist framework for parsing
  </b>
</p>

<h2 align="center">
  Install
</h2>


```bash
npm install --save cursornext
```

<h2 align="center">
  Getting Started
</h2>

### Create a new cursor

```js
const { Cursor } = require('cursor')

const cursor = Cursor.from({ doc: `Hello, World!` })
```

### Moving cursor

```js
// Hello, World!
// ^
cursor.next(7)

// Hello, World!
//        ^
cursor.startsWith('World')
// => true
```

<h2 align="center">
  Examples
</h2>

### Parse an Integer

```js
function isDigit(cursor) {
  return cursor.exec(/^[0-9]/)
}

function parseNumber(cursor) {
  const marker = cursor.clone()

  while (isDigit(cursor) && !cursor.isEof()) {
    cursor.next(1)
  }

  const value =  parseInt(marker.takeUntil(cursor))

  return {
    type: 'Number',
    value
  }
}

function main() {
  const cursor = Cursor.from({ doc: '1996' })

  console.log(parseNumber(cursor))
  // => { type: 'Number', value: 1996 }
}

main()
```

### Escape Quotes

```js
function parseString(cursor) {
  cursor.next(1)

  const marker = cursor.clone()

  while (!cursor.startsWith('"') && !cursor.isEof()) {
    if (cursor.startsWith('\\')) {
      cursor.next(2)
    } else {
      cursor.next(1)
    }
  }

  const value = marker.takeUntil(cursor).replace(/\\(.)/g, '$1')

  if (!cursor.isEof()) {
    cursor.next(1)
  }

  return {
    type: 'String',
    value
  }
}

function main() {
  const cursor = Cursor.from({ doc: `"cow says: \\"Boo, hoo!\\""` })

  console.log(parseString(cursor))
  // => { type: 'String', value: 'cow says: "Boo,\\ hoo!"' }
}

main()
```

### Backtrack

```js
const marker = cursor.clone()

while (!cursor.isEof()) {
  if (cursor.startsWith('World')) {
    
    // Hello, World!
    // ^      ^
    // |      cursor
    // marker
    cursor.moveTo(marker)
  }
}

// Hello, World!
// ^
// cursor
// marker
```

<h2 align="center">
  API Reference
</h2>

### next

```js
// 123456
// ^
cursor.next(3)

// 123456
//    ^
```

### clone

```js
// Hello, World!
// ^
// cursor
const marker = cursor.clone()

// Hello, World!
// ^
// cursor
// marker

cursor.next(7)

// Hello, World!
// ^      ^
// |      cursor
// marker
```

### startsWith

```js
// Hello, World!
//        ^
cursor.startsWith('World')
// => true
```

### oneOf

```js
// aaaabcccc
//    ^
cursor.oneOf(['abb', 'abc', 'accc'])
// => 'abc'
```

### lookahead

```js
// Hello, World!
//        ^
cursor.lookahead(5)
// => 'World'
```

### exec

```js
// 1996
//    ^
cursor.exec(/^[0-9]/)
// => [ '6', index: 3, input: '1996', groups: undefined ]
```

### takeUntil

```js
// cow says: Boo, hoo!
//           ^        ^
//           |        cursor
//           marker
marker.takeUntil(cursor)
// => 'Boo, hoo!'
```

### moveTo

```js
// cow says: Boo, hoo!
//           ^    ^
//           |    cursor
//           marker
cursor.moveTo(marker)

// cow says: Boo, hoo!
//           ^
//           cursor
//           marker
```

### isEof

```js
// Hello, World!
//              ^
//              EOF
//              cursor
cursor.isEof()
// => true
```

### setIndex

```js
// cow says: Boo, hoo!
// ^
// cursor
cursor.setIndex(8)

// cow says: Boo, hoo!
//         ^
//         cursor
cursor.startsWith(':')
// => true
```

### setEndIndex

```js
// cow says: Boo, hoo!
//         ^          ^
//         cursor     EOF
cursor.setEndIndex(cursor.index)

// cow says: Boo, hoo!
//         ^
//         cursor
//         EOF
cursor.isEof()
// => true
```

### endIndex

```js
// cow says: Boo, hoo!
//     ^              ^
//     cursor         EOF
cursor.endIndex()
// => 19
```

LICENSE
-------

[MIT License](LICENSE)
