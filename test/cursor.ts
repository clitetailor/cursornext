import test from 'ava'
import { Cursor } from '../src'
import { runParseTest } from './helpers/runner'

test('`exec` should work probably', t => {
  function isDigit(cursor: Cursor) {
    return !!cursor.exec(/^[0-9]/)
  }

  runParseTest(t, isDigit)
})

test('`startsWith` should work probably', t => {
  const digits = Array.from({ length: 10 }, (v, k) =>
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

  runParseTest(t, isDigit)
})

test('`oneOf` should work probably', t => {
  const digits = Array.from({ length: 10 }, (v, k) =>
    k.toString()
  )

  function isDigit(cursor: Cursor) {
    return !!cursor.oneOf(digits)
  }

  runParseTest(t, isDigit)
})

test('`lookahead` should work probably', t => {
  function isDigit(cursor: Cursor) {
    const char = cursor.lookahead(1)

    return '0' <= char && char <= '9'
  }

  runParseTest(t, isDigit)
})
