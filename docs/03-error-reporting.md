# Error Reporting

When parsing, the input document may contains both syntax and semantic errors. Creating a meaningful error message can give a clear explanation about what the error is and where the error happens. The following are methods that can helps you to build a meaningful error message format.

## Methods

### `getLoc`

Loc is a data structure represents cursor position including line, column and current index. `getLoc` extracts the cursor position and returns the corresponding `Loc` item:

```ts
const { cursor } = t.capture(`
  Hello, World! 🌵(cursor)
`)

const loc = cursor.getLoc()

assert(loc.line, 2)
assert(loc.column, 17)
assert(loc.index, 18)
```

### `extractLine`

`extractLine` takes an input line number and returns the corresponding line from the document:

```ts
const { cursor } = t.capture(`
  Hello, World! 🌵(cursor)
`)

const loc = cursor.getLoc()

assert(cursor.extractLine(loc.line), '  Hello, World! \n')
```

By default, `extractLine` will include the line ending character. You can exclude the character by setting the second parameter to false.

```ts
cursor.extractLine(loc.line, false)
```

## Print the error message

An error message often consists of four parts:

- The line numbers
- The error line and the surrounding lines
- An indicator indicates the cursor position
- A label explains why the error occurs

For example:

```
 9 | a=5  b=6  c=7
10 | a=1  b=2  c
   |            ^ equal sign expected here!
11 |
```

To get the error line and the surrounding lines, we get the line number by using `getLoc`, then extract the line using `extractLine`.

```ts
const loc = cursor.getLoc()
const lines = []

for (let i = loc.line - 1; i <= loc + 1; ++i) {
  const line = cursor.extractLine(loc.line)

  lines.push(line)
}

const message = lines.join('')
```

The margin size is often larger than the size of the line numbers. To align the line numbers, we can pad them to the length of the largest one.

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
