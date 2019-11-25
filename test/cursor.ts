import test, { ExecutionContext } from 'ava'
import { Cursor, t as tt } from '../src'

export function parseTest(
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

  const iter = tt
    .capture(
      '-----🌵()1992🌵()------🌵()12🌵()---🌵()86🌵()---'
    )
    .toIter()
  const values = [1992, 12, 86]

  values.forEach(value => {
    const cursor = iter.next()
    const target = iter.next()

    const input = parseInteger(cursor)

    t.deepEqual(input, {
      type: 'Integer',
      value
    })
    t.is(cursor.index, target.index, cursor.doc)
  })
}

test('`exec` should work probably', t => {
  function isDigit(cursor: Cursor): boolean {
    return !!cursor.exec(/[0-9]/y)
  }

  parseTest(t, isDigit)
})

test('`startsWith` should work probably', t => {
  const digits = Array.from({ length: 10 }, (_v, k) =>
    k.toString()
  )

  function isDigit(cursor: Cursor) {
    for (const digit of digits) {
      if (cursor.startsWith(digit)) {
        return true
      }
    }

    return false
  }

  parseTest(t, isDigit)
})

test('`oneOf` should work probably', t => {
  const digits = Array.from({ length: 10 }, (_v, k) =>
    k.toString()
  )

  function isDigit(cursor: Cursor) {
    return !!cursor.oneOf(digits)
  }

  parseTest(t, isDigit)
})

test('`lookahead` should work probably', t => {
  function isDigit(cursor: Cursor) {
    const char = cursor.lookahead(1)

    return '0' <= char && char <= '9'
  }

  parseTest(t, isDigit)
})
