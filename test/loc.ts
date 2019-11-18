import test, { ExecutionContext } from 'ava'
import { t as tt } from '../src'

export function locTest(
  t: ExecutionContext,
  input: string,
  expected: {
    line: number
    column: number
  }
) {
  const cursor = tt
    .capture(input)
    .toIter()
    .next()

  const loc = cursor.getLoc()

  t.is(loc.line, expected.line, cursor.doc)
  t.is(loc.column, expected.column, cursor.doc)
}

test('`getLoc` should work probably', t => {
  const firstDoc = tt.trim(`
    Hello, World!
    This is an example 🌵\`getLoc\` test.
  `)

  locTest(t, firstDoc, {
    line: 2,
    column: 24
  })

  const secondDoc = tt.trim(`
    The following loc should refer to line 1 and column 56.🌵
  `)

  locTest(t, secondDoc, {
    line: 1,
    column: 60
  })
})

export function extractLineTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const cursor = tt
    .capture(input)
    .toIter()
    .next()

  const loc = cursor.getLoc()

  const output = Array.from({ length: 3 }, (_v, k) => k)
    .map(i => loc.line - 1 + i)
    .map(lineNumber => {
      const line = cursor.extractLine(lineNumber)

      return line ? `${lineNumber} | ${line}` : undefined
    })
    .filter(line => line)
    .join('')

  t.is(output, expected, cursor.doc)
}

test('`extractLine` should work probably', t => {
  const doc = tt.trim(`


    Hello, World!
    This is an example 🌵\`getLoc\` test.
  `)

  const extractedLine = tt.trim(`
3 |     Hello, World!
4 |     This is an example \`getLoc\` test.
  `)

  extractLineTest(t, doc, extractedLine)
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
  const doc = tt.trim(`


    Hello, World!
    This is an example 🌵\`getLoc\` test.
  `)

  const debugMsg = tt.trim(`
3 |     Hello, World!
4 |     This is an example \`getLoc\` test.
  |                        ^
  `)

  printDebugTest(t, doc, debugMsg)
})
