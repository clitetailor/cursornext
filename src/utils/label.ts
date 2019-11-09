import { Cursor } from '../cursor'

export function parseLabel(cursor: Cursor): string {
  if (cursor.startsWith('(')) {
    cursor.next(1)
    const marker = cursor.clone()

    while (!cursor.startsWith(')') && !cursor.isEof()) {
      cursor.next(1)
    }

    const name = marker.takeUntil(cursor)
    cursor.next(1)

    return name
  }

  return ''
}
