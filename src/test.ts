import { Cursor } from './cursor'
import { parseLabel } from './utils'

export interface TestOptions {
  prefix: string
  noLabel: boolean
}

export interface CursorMap {
  [name: string]: Cursor
}

export type CaptureResult = {
  [name: string]: any
  iter(): CaptureIterable
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

export class Test {
  clone(testOptions: TestOptions) {}

  capture(
    caretSyntax: string,
    testOptions?: TestOptions
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

        names.push(
          !noLabel ? parseLabel(caretCursor) : undefined
        )

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
      iter: () => new CaptureIterable(cursors)
    }
  }
}

export const t = new Test()
