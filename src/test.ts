import { Cursor } from './cursor'
import { parseLabel } from './utils'

export interface CursorTestOptions {
  prefix: string
  noLabel: boolean
}

export interface CursorMap {
  [name: string]: Cursor
}

export interface CaptureResult {
  [name: string]: any
  iter(options?: Partial<IterableOptions>): CaptureIterable
}

export interface IterableOptions {
  named: boolean | undefined
}

export class CaptureIterable {
  private index: number

  constructor(private cursors: Cursor[] = []) {
    this.index = 0
  }

  next(): Cursor {
    const value = this.cursors[this.index]
    if (value) {
      ++this.index
    }

    return value
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        const value = this.next()

        return value
          ? { value, done: false }
          : { value, done: true }
      }
    }
  }

  toArray() {
    return this.cursors
  }
}

export class CursorTest {
  clone(testOptions: CursorTestOptions) {}

  capture(
    caretSyntax: string,
    testOptions?: CursorTestOptions
  ): CaptureResult {
    const caretCursor = Cursor.from(caretSyntax)

    let offset = 0
    let lastIndex = 0
    const indexes: number[] = []
    const names: (string | undefined)[] = []
    const chunks: string[] = []

    const { prefix, noLabel } = {
      prefix: '🌵',
      noLabel: false,
      ...testOptions
    }
    const prefixLen = prefix.length

    while (!caretCursor.isEof()) {
      if (caretCursor.startsWith(prefix)) {
        const index = caretCursor.index

        indexes.push(index - offset)
        chunks.push(caretSyntax.substring(lastIndex, index))

        caretCursor.next(prefixLen)

        if (!noLabel) {
          const name = parseLabel(caretCursor)

          switch (name) {
            case 'iter':
            case '':
              names.push(undefined)
              break
            case 'symbol':
              chunks.push(prefix)
              break
            default:
              names.push(name)
              break
          }
        } else {
          names.push(undefined)
        }

        lastIndex = caretCursor.index
        offset += caretCursor.index - index
      } else {
        caretCursor.next(1)
      }
    }

    chunks.push(caretSyntax.substring(lastIndex))
    const doc = chunks.join('')

    const cursors = indexes.map(
      index => new Cursor({ doc, index })
    )

    const namedCursors: CursorMap = names.reduce(
      (target, name, index) => {
        return name
          ? {
              ...target,
              [name]: new Cursor({ doc, index: indexes[index] })
            }
          : target
      },
      {}
    )

    return {
      ...namedCursors,
      iter: ({
        named = false
      }: Partial<IterableOptions> = {}) =>
        named
          ? new CaptureIterable(cursors)
          : new CaptureIterable(
              cursors.filter((cursor, index) => !names[index])
            )
    }
  }
}

export const t = new CursorTest()
