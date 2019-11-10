import test, { ExecutionContext } from 'ava'
import { t as tt, CapturePair } from '../../src'

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
  toIterTest(
    t,
    `
    🌵test🌵
    `,
    'test'
  )
})

export function toMapTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const [start, end] = tt.capture(input).toArray()

  t.is(start.takeUntil(end), expected)
}

test('`toMap` should works probably', t => {
  toMapTest(
    t,
    `
    🌵(start)test🌵(end)
    `,
    'test'
  )
})

export function toArrayTest(
  t: ExecutionContext,
  input: string,
  expected: string
) {
  const [start, end] = tt.capture(input).toArray()

  t.is(start.takeUntil(end), expected)
}

test('`toArray` should works probably', t => {
  toArrayTest(
    t,
    `
    🌵test🌵
    `,
    'test'
  )
})

export function toPairsTest(
  t: ExecutionContext,
  input: string,
  count: number,
  callback: (pair: CapturePair) => void
) {
  const pairs = tt.inline(input).toPairs()

  t.is(pairs.length, count)

  pairs.forEach(callback)
}

test('`toPairs()` should works probably', t => {
  toPairsTest(
    t,
    `
    🌵(pair)🌵(key)a🌵(key) = 🌵(value)5🌵(value)🌵(pair)
    `,
    3,
    ({ label, start, end }) => {
      switch (label) {
        case 'pair':
          t.is(start.takeUntil(end), 'a = 5')

          break
        case 'key':
          t.is(start.takeUntil(end), 'a')

          break
        case 'value':
          t.is(start.takeUntil(end), '5')

          break
      }
    }
  )
})
