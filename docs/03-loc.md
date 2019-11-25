# Loc

Manually working with line and column number can be complex and inefficent. Loc API provides methods to make working with lines and columns easier and much more expressive.

## Methods

### `getLoc()`

Get the information about current cursor location.

```ts
const { cursor } = t.capture(`
  Hello, World! 🌵(cursor)
`)

const loc = cursor.getLoc()

t.is(loc.line, 2)
t.is(loc.column, 17)
t.is(loc.index, 18)
```

### `extractLine()`

Extracts a specific line.

```ts
const { cursor } = t.capture(`
  Hello, World! 🌵(cursor)
`)

const loc = cursor.getLoc()

t.is(cursor.extractLine(loc.line), '  Hello, World! ')
```

By default, `extractLine()` will not include the line ending characters. You can change the behavior by setting the second parameter to `true`.

```ts
cursor.extractLine(loc.line, true)
```

### `extracEol()`

Extracts the eol characters of a specific line.

```ts
const loc = cursor.getLoc()
const eol = cursor.extractEol(loc.line)

t.is(eol.type, EolType.LF)
```

## Building the error message using Loc API

An error message often consists of four parts:

- The line numbers
- The error line and the surrounding lines
- An indicator indicates the cursor position
- A label explains why the error occurs

For example:

```
 9 |   "version": "0.0.1",
10 |   "main": ...,
   |           ^ Value expected
   |
11 |   "module": "index.mjs",
```

To get the error line and the surrounding lines, we get the line number by using `getLoc()`, then extract the line using `extractLine()`.

```ts
const loc = cursor.getLoc()
const lines = []

for (let i = loc.line - 1; i <= loc + 1; ++i) {
  const line = cursor.extractLine(loc.line)

  lines.push(line)
}

const message = lines.join('')
```

To align the line numbers, we need to pad the line numbers to the length of the largest line number.

```ts
const padLength = (loc.line + 1).toString().length

for (let i = loc.line - 1; i < loc.line + 1; ++i) {
  const line = cursor.extractLine(loc.line)
  const lineNumber = i.toString().padStart(padLength)

  line.push(`${lineNumber} | ${line}`)
}
```

Following the error line, an additional line is added to indicate the cursor position and explain the error.

```ts
if (i === loc.column) {
  const margin = ' '.repeat(padLength)
  const whitespaces = ' '.repeat(loc.column - 1)
  const additionalLine = `${margin} | ${whitespaces}^ ${errorMsg}\n`

  lines.push(additionalLine)
}
```

The overall function can be seen like so:

```ts
function printError(cursor: Cursor, errorMsg: string): string {
  const loc = cursor.getLoc()
  const padLength = (loc.line + 1).toString().length

  const lines = []

  for (let i = loc.line - 1; i < loc.line + 2; ++i) {
    const line = cursor.extractLine(i)
    if (!line) {
      continue
    }

    const lineNumber = i.toString().padStart(padLength)

    lines.push(`${lineNumber} | ${line}`)

    if (i === loc.line) {
      const margin = ' '.repeat(padLength)
      const whitespaces = ' '.repeat(loc.column - 1)
      const additionalLine = `${margin} | ${whitespaces}^ ${errorMsg}\n`

      lines.push(additionalLine)
    }
  }

  return lines.join('')
}
```
