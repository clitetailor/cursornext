import test, { ExecutionContext } from 'ava'
import { t as tt, CaptureResult } from '../../src'

function toIterTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const iter = tt.capture(input).toIter()
  const start = iter.next()
  const end = iter.next()

  t.is(start.takeUntil(end), expected)
}

test('`toIter` should works probably', t => {
  const captureResult = `
    🌵test🌵
  `

  toIterTest(t, captureResult, 'test')
})

export function toMapTest(
  t: ExecutionContext,
  input: CaptureResult,
  expected: string
) {
  const [start, end] = input.toArray()

  t.is(start.takeUntil(end), expected)
}

test('`toMap` should works probably', t => {
  const captureResult = tt.capture(`
    🌵(start)test🌵(end)
  `)

  toMapTest(t, captureResult, 'test')
})

export function toArrayTest(
  t: ExecutionContext,
  input: CaptureResult,
  expected: string
) {
  const [start, end] = input.toArray()

  t.is(start.takeUntil(end), expected)
}

test('`toArray` should works probably', t => {
  const captureResult = tt.capture(`
    🌵test🌵
  `)

  toArrayTest(t, captureResult, 'test')
})

export function toPairsTest(
  t: ExecutionContext,
  input: CaptureResult,
  expected: { [label: string]: string }
) {
  input.toPairs().forEach(({ label, start, end }) => {
    t.is(start.takeUntil(end), expected[label])
  })
}

test('`toPairs` should works probably', t => {
  const captureResult = tt.capture(`
    🌵(field)🌵(key)a🌵(key) = 🌵(value)5🌵(value)🌵(field)
  `)

  toPairsTest(t, captureResult, {
    field: 'a = 5',
    key: 'a',
    value: '5'
  })
})
