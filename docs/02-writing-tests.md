# Writing Tests

For writing tests, cursornext provides you with the caret syntax.

```ts
import { t } from 'cursornext'

const { cursor, target } = t
  .capture('-----🌵(cursor)1992🌵(target)------12---86---')
  .toMap()
```

In cursornext, there are two syntax styles:

- Inline style
- Block style

In inline style syntax, the cursor name is wrapped inside parentheses and prefixed with the `🌵` symbol (which is `Alt + 127797` on Windows).

```
-----🌵(cursor)1992🌵(target)------12---86---
```

To generate test case from the inline syntax, you can use `inline()` method:

```ts
const { cursor, target } = t
  .inline('----🌵(cursor)1992🌵(target)------12---86---')
  .toMap()
```

In block style syntax, lines from document are marked with line numbers. Lines without line numbers are used to describe cursors positions.

```
1 | -----1992------12---86---
  |      ^   ^
  |      |   target
  |      cursor
```

To generate test case from the block syntax, we can use the `block()` method:

```ts
const { cursor, target } = t
  .block(
    `
      1 | -----1992------12---86---
        |      ^   ^
        |      |   target
        |      cursor
    `
  )
  .toMap()
```

## Writing your first test case

The following function takes a cursor as an input, parse an integer and returns the corresponding token. If the input string does not match, it returns `null`:

```ts
function parseInteger(cursor: Cursor) {
  const marker = cursor.clone()

  if (!cursor.exec(/^[0-9]/)) {
    return null
  }

  while (cursor.exec(/^[0-9]/)) {
    cursor.next(1)
  }

  const value = parseInt(marker.takeUntil(cursor))

  return {
    type: 'Integer',
    value
  }
}
```

Given the following caret syntax:

```
1 | -----1992------12---86---
  |      ^   ^
  |      |   target
  |      cursor
```

After running `parseInteger`, the cursor is expected to be at the target position, a token is returned.

```
1 | -----1992------12---86---
  |          ^
  |          target
  |          cursor
```

The equivalent test case would be:

```ts
const { cursor, target } = t
  .block(
    `
      1 | -----1992------12---86---
        |      ^   ^
        |      |   target
        |      cursor
    `
  )
  .toMap()

const token = parseInteger(cursor)

t.assert(cursor.isAt(target))
t.deepEqual(token, {
  type: 'Integer',
  value: 1992
})
```

## Capture Result

### `toMap()`

Returns a map of cursors with each key is a respective label.

```ts
const { cursor, target } = t
  .inline('-----🌵(cursor)1992🌵(target)------12---86---')
  .toMap()
```

### `toArray()`

Returns an array of captured cursors.

```ts
const [cursor, target] = t
  .inline('-----🌵(cursor)1992🌵(target)------12---86---')
  .toArray()
```

### `toIter()`

Returns an iterator, which can be used to iterate over the list of captured cursors in order.

```ts
const iter = t
  .inline('-----🌵1992🌵------🌵12🌵---🌵86🌵---')
  .toIter()

for (const value in [1992, 12, 86]) {
  const cursor = iter.next()
  const target = iter.next()

  const token = parseInteger(cursor)

  t.is(token, null)
  t.is(token.type, 'Interger')
  t.is(token.value, value)
}
```

For people who prefer to work with iterator, we can explicitly omit the labeled cursors by setting `noLabel` option to `true`.

```ts
const iter = t
  .inline('-----🌵1992🌵------🌵12🌵---🌵86🌵---', {
    noLabel: true
  })
  .toIter()
```

### `toPairs()`

Returns captured cursors by pairs. To use `toPairs()`, cursor label should be renamed to contains `start` and `end` keywords. The pair labels are named using the inner cursor labels.

```ts
const pairs = t
  .block(
    `
      1 | {
      2 |   "type": "Integer",
        |   ^     ^ ^        ^
        |   |     | |        end(value)
        |   |     | |        end(field)
        |   |     | start(value)
        |   |     end(key)
        |   start(key)
        |   start(field)
        |
      3 |   "value": 1992
      4 | }
      5 | 
    `
  )
  .toPairs()

t.is(pairs.length, 3)

for (const { label, start, end } of pairs) {
  const value = start.takeUntil(end)

  switch (label) {
    case 'key':
      t.is(value, '"type"')
      break

    case 'value':
      t.is(value, '"Integer"')
      break

    case 'field':
      t.is(value, '"type": "Integer"')
      break

    default:
      break
  }
}
```

## Configuration

There are three ways we can change the configuration of the test object:

- Change the configuration per test case.
- Change the global configuration.
- Create a custom test object.

You can config the test object per test case by passing config options as the second parameter:

```ts
t.capture('-----🔥1992🔥------12---86---', {
  prefix: '🔥',
  noLabel: true
})
```

The global configuration can be changed by using `config()`:

```ts
t.config({
  prefix: '🔥',
  noLabel: true
})
```

## Preserved Labels

### `🌵()` and `🌵(none)`

In caret syntax, empty labels are named `none` by default.

```ts
const captureResult = t.capture(
  '🌵()function 🌵()() 🌵(){ console.log("Ok!") }🌵()'
)
```

The above code would be rendered as:

```
1 | function () { console.log("Ok!") }
  | ^        ^  ^                     ^
  | |        |  |                     none
  | |        |  none
  | |        none
  | none
```

```ts
t.is(captureResult.toArray().length, 4)
```

### `🌵(symbol)`

The `symbol` label is used not to generate a new cursor but to insert the prefix symbol `🌵` to the document instead. It is often used in inline syntax where prefix symbol are often escaped. The following syntax:

```
Hello, cactus! 🌵(symbol)
```

Would be rendered as:

```
1 | Hello, cactus! 🌵
```
