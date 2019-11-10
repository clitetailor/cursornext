import { Cursor } from '../cursor'

export function parseLabel(cursor: Cursor): string {
  if (cursor.startsWith('(')) {
    cursor.next(1)
    const marker = cursor.clone()

    while (!cursor.startsWith(')') && !cursor.isEof()) {
      cursor.next(1)
    }

    const label = marker.takeUntil(cursor)
    cursor.next(1)

    return label
  }

  return ''
}
