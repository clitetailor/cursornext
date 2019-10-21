# Writing Tests

For writing tests, cursornext provide you with the caret syntax. For example:

```ts
import { t } from 'cursornext'

const { cursor, target } = t.capture(
  '-----🌵(cursor)1992🌵(target)------12---86---'
)
```

In caret syntax, cursor name is wrapped inside parentheses and prefixed with the `🌵` symbol (which is `Alt + 127797`). The above code will extract two cursors named `cursor` and `target` from the document and placed them at their respective positions. The following diagram represents the generated document and cursor positions:

```
1 | -----1992------12---86---
  |      ^   ^
  |      |   target
  |      cursor
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

The global configuration can be changed via `config` method:

```ts
t.config({
  prefix: '🔥',
  noLabel: true
})
```

You can also create your own test object via `options` method:

```ts
const customTest = t.options({
  prefix: '🔥',
  noLabel: true
})
```

## Writing your first test case

First, we will create a `parseInteger` function that parse the integer and return corresponding token:

```ts
function parseInteger(cursor: Cursor) {
  const marker = cursor.clone()

  while (cursor.exec(/^[0-9]+/) && !cursor.isEof()) {
    cursor.next(1)
  }

  const value = parseInt(marker.takeUntil(cursor))

  if (isNaN(value)) {
    return null
  }

  return {
    type: 'Integer',
    value
  }
}
```

Given the following caret diagram:

```
1 | -----1992------12---86---
  |      ^   ^
  |      |   target
  |      cursor
```

After running `parseInteger`, the cursor is expected to be moved to the target position. The caret diagram that describes the result will be:

```
1 | -----1992------12---86---
  |          ^
  |          target
  |          cursor
```

```ts
const token = parseInteger(cursor)

t.assert(cursor.isAt(target))
t.assert(token ? token.value === 1992 : false)
```

## Iteration Mode

A no named cursor can be iterated via `iter` method. This way you can work with multi-cursor test case:

```ts
const iter = t
  .capture('-----🌵()1992🌵()------🌵()12🌵()---🌵()86🌵()---')
  .iter()

for (const value in [1992, 12, 86]) {
  const cursor = iter.next()
  const target = iter.next()

  const token = parseInteger(cursor)

  t.assert(token !== null)
  t.assert(token.type === 'Interger'))
  t.assert(token.value === value)
}
```

For people who prefer to work with iterator, you can disable named cursor via `noLabel` option:

```ts
const iter = t
  .capture('-----🌵1992🌵------🌵12🌵---🌵86🌵---', {
    noLabel: true
  })
  .iter()
```

```ts
const [cursor, target] = t
  .capture('-----🌵1992🌵------12---86---', {
    noLabel: true
  })
  .iter()
  .toArray()
```

This will remove the ambiguity when working with parentheses:

```ts
const [cursor, target] = t
  .capture('function iter🌵()🌵 { }', {
    noLabel: true
  })
  .iter()
  .toArray()
```

## Preserved Symbols

### `🌵()` and `🌵(iter)`

The caret sequence will add a cursor to the iterator group:

```ts
const captureResult = t.capture(
  '🌵()function 🌵()() 🌵(){ console.log("Ok!") }🌵()'
)
```

This above code will be rendered as:

```
1 | function () { console.log("Ok!") }
  | ^        ^  ^                     ^
```

```ts
t.asserts(captureResult.iter().toArray().length === 4)
```

### `🌵(symbol)`

This caret sequence generates the prefix symbol to the document. No extra cursor will be added to the capture result. For example:

```ts
const captureResult = t.capture('Hello, cactus! 🌵(symbol)')
```

This would render the following diagram:

```
1 | Hello, cactus! 🌵
```

```ts
t.assert(captureResult.symbol === undefined)
```
