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
  captureTest(
    t,
    tt.capture(
      tt.trim(`
This is an example how inline syntax works!
Here 🌵 is an cactus! 🌵(symbol)
      `)
    ),
    tt.trim(`
This is an example how inline syntax works!
Here  is an cactus! 🌵
    `)
  )
})

export function inlineTest(
  t: ExecutionContext,
  input: CaptureResult,
  expected: string
) {
  const cursor = input.toIter().next()

  t.is(cursor.doc, expected, cursor.doc)
}

test('`inline` should works probably', t => {
  inlineTest(
    t,
    tt.inline(`
This is an example how inline syntax works!
Here 🌵 is an cactus! 🌵(symbol)
    `),
    tt.trim(`
This is an example how inline syntax works!
Here  is an cactus! 🌵
    `)
  )
})
