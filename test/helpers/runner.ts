import { ExecutionContext } from 'ava'
import { Cursor, t as cursorTest, CursorMap } from '../../src'
import { trimNewLine } from './normalize'

export function runParseTest(
  t: ExecutionContext,
  isDigit: (cursor: Cursor) => boolean
) {
  function parseInteger(cursor: Cursor) {
    const marker = cursor.clone()

    while (isDigit(cursor) && !cursor.isEof()) {
      cursor.next(1)
    }

    const value = parseInt(marker.takeUntil(cursor))

    return {
      type: 'Integer',
      value
    }
  }

  const iter = cursorTest
    .capture(
      '-----🌵()1992🌵()------🌵()12🌵()---🌵()86🌵()---'
    )
    .iter()
  const values = [1992, 12, 86]

  values.forEach(value => {
    const cursor = iter.next()
    const marker = iter.next()

    const input = parseInteger(cursor)

    t.deepEqual(input, {
      type: 'Integer',
      value
    })
    t.is(cursor.index, marker.index, cursor.doc)
  })
}

export function runLocTest(
  t: ExecutionContext,
  input: string,
  line: number,
  column: number
) {
  const iter = cursorTest.capture(trimNewLine(input)).iter()
  const cursor = iter.next()

  const loc = cursor.getLoc()

  t.is(loc.line, line, cursor.doc)
  t.is(loc.column, column, cursor.doc)
}

export function runGetLineTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const iter = cursorTest.capture(trimNewLine(input)).iter()
  const cursor = iter.next()

  const loc = cursor.getLoc()

  const output = Array.from({ length: 3 }, (v, k) => k)
    .map(i => loc.line - 1 + i)
    .map(lineNumber => {
      const line = cursor.getLine(lineNumber)

      return line ? `${lineNumber} | ${line}` : undefined
    })
    .filter(line => line)
    .join('')

  t.is(output, trimNewLine(expected), cursor.doc)
}

export function runPrintDebugTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const iter = cursorTest.capture(trimNewLine(input)).iter()
  const cursor = iter.next()

  const output = cursor.printDebug()

  t.is(output, trimNewLine(expected), trimNewLine(expected))
}
