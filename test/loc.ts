import test, { ExecutionContext } from 'ava'
import { t as tt } from '../src'

export function locTest(
  t: ExecutionContext,
  input: string,
  line: number,
  column: number
) {
  const cursor = tt
    .capture(input)
    .toIter()
    .next()

  const loc = cursor.getLoc()

  t.is(loc.line, line, cursor.doc)
  t.is(loc.column, column, cursor.doc)
}

test('`getLoc` should work probably', t => {
  locTest(
    t,
    tt.trim(`
Hello, World!
This is an example 🌵\`getLoc\` test.
    `),
    2,
    20
  )
  locTest(
    t,
    tt.trim(`
The following loc should refer to line 1 and column 56.🌵
    `),
    1,
    56
  )
})

export function getLineTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const cursor = tt
    .capture(input)
    .toIter()
    .next()

  const loc = cursor.getLoc()

  const output = Array.from({ length: 3 }, (v, k) => k)
    .map(i => loc.line - 1 + i)
    .map(lineNumber => {
      const line = cursor.extractLine(lineNumber)

      return line ? `${lineNumber} | ${line}` : undefined
    })
    .filter(line => line)
    .join('')

  t.is(output, expected, cursor.doc)
}

test('`getLine` should work probably', t => {
  getLineTest(
    t,
    tt.trim(`


Hello, World!
This is an example 🌵\`getLoc\` test.
    `),
    tt.trim(`
3 | Hello, World!
4 | This is an example \`getLoc\` test.
    `)
  )
})

export function printDebugTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const cursor = tt
    .capture(input)
    .toIter()
    .next()

  const output = cursor.printDebug()

  t.is(output, expected, expected)
}

test('`printDebug` should work probably', t => {
  printDebugTest(
    t,
    tt.trim(`


Hello, World!
This is an example 🌵\`getLoc\` test.
    `),
    tt.trim(`
3 | Hello, World!
4 | This is an example \`getLoc\` test.
  |                    ^
    `)
  )
})
