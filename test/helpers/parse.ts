import { ExecutionContext } from 'ava'
import { Cursor, t as cursorTest } from '../../src'

export function runParse(
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
    t.is(cursor.index, marker.index)
  })
}
