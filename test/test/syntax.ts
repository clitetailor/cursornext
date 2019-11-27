import test, { ExecutionContext } from 'ava'
import { t as tt, CaptureResult } from '../../src'

export function captureTest(
  t: ExecutionContext,
  input: CaptureResult,
  expected: string
) {
  const cursor = input.toIter().next()

  t.is(cursor.doc, expected, cursor.doc)
}

test('`capture` should works probably', t => {
  const captureResult = tt.capture(
    tt.trim(`
      This is an example how inline syntax works!
      Here 🌵 is an cactus! 🌵(symbol)
    `)
  )

  const doc = tt.trim(`
      This is an example how inline syntax works!
      Here  is an cactus! 🌵
  `)

  captureTest(t, captureResult, doc)
})

export function inlineTest(
  t: ExecutionContext,
  input: CaptureResult,
  expected: string
) {
  const cursor = input.toIter().next()

  t.is(cursor.doc, expected, cursor.doc)
}

test('`symbol` should works probably', t => {
  const captureResult = tt.inline(`
    This is an example how inline syntax works!
    Here 🌵 is an cactus! 🌵(symbol)
  `)

  const doc = tt.trim(`
    This is an example how inline syntax works!
    Here  is an cactus! 🌵
  `)

  inlineTest(t, captureResult, doc)
})

export function blockTest(
  t: ExecutionContext,
  input: CaptureResult,
  expected: { [label: string]: string }
) {
  input.toPairs().forEach(({ label, start, end }) => {
    t.is(start.takeUntil(end), expected[label])
  })
}

test('`block` should works probably', t => {
  const captureResult = tt.block(
    `
      1 | -------1992---------13----
        |        ^   ^        ^ ^
        |        |   |        | end(second)
        |        |   |        start(second)
        |        |   end(first)
        |        start(range)
        |        start(first)
        |
      2 | -------71---------------
        |        ^ ^
        |        | end(third)
        |        | end(range)
        |        start(third)
    `
  )

  blockTest(t, captureResult, {
    first: '1992',
    second: '13',
    third: '71',
    range: '1992---------13----\n-------71'
  })
})
