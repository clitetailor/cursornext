import test from 'ava'
import { t as cursorTest, Cursor } from '../src'
import { runParse } from './helpers/parse'

test('`exec` should work probably', t => {
  function isDigit(cursor: Cursor) {
    return !!cursor.exec(/^[0-9]/)
  }

  runParse(t, isDigit)
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

  runParse(t, isDigit)
})

test('`oneOf` should work probably', t => {
  const digits = Array.from({ length: 10 }, (v, k) =>
    k.toString()
  )

  function isDigit(cursor: Cursor) {
    return !!cursor.oneOf(digits)
  }

  runParse(t, isDigit)
})

test('`lookahead` should work probably', t => {
  function isDigit(cursor: Cursor) {
    const char = cursor.lookahead(1)

    return '0' <= char && char <= '9'
  }

  runParse(t, isDigit)
})
