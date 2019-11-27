# Loc

Loc API provides methods for getting cursor position and extracting lines using line numbers.

## Methods

### `getLoc()`

Get the current position of the cursor.

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

Extract a specific line using line number.

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

Extract the eol characters of a specific line using line number.

```ts
const loc = cursor.getLoc()
const eol = cursor.extractEol(loc.line)

t.is(eol.type, EolType.LF)
```

## Building the error message using Loc API

An error message often consists of four parts:

- The line numbers
- The surrounding lines of code
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

To print the surrounding lines of code, we extract the line numbers using `getLoc()`, then get the surrounding lines by using `extractLine()`.

```ts
const loc = cursor.getLoc()
const lines = []

for (let i = loc.line - 1; i <= loc + 1; ++i) {
  const line = cursor.extractLine(loc.line)

  lines.push(line)
}

const message = lines.join('')
```

Then we align line numbers to the right by padding the line numbers.

```ts
const padLength = (loc.line + 1).toString().length

for (let i = loc.line - 1; i < loc.line + 1; ++i) {
  const line = cursor.extractLine(loc.line)
  const lineNumber = i.toString().padStart(padLength)

  line.push(`${lineNumber} | ${line}`)
}
```

Following the current error line, an additional line is added to indicate the cursor position and explain the error.

```ts
if (i === loc.column) {
  const margin = ' '.repeat(padLength)
  const whitespaces = ' '.repeat(loc.column - 1)
  const additionalLine = `${margin} | ${whitespaces}^ ${errorMsg}\n`

  lines.push(additionalLine)
}
```

Here is the full implementation of the `printError()` function:

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
      const additionalLine = `${margin} | ${whitespaces}^ ${errorMsg}`

      lines.push(additionalLine)
    }
  }

  return lines.join('\n')
}
```
