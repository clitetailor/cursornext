import { Cursor } from './cursor'
import { parseLabel } from './utils/label'
import { trimNewLine } from './utils/string'

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
  private options: CursorTestOptions

  constructor(options?: CursorTestOptions) {
    this.options = options || {
      prefix: '🌵',
      noLabel: false
    }
  }

  clone(testOptions: CursorTestOptions) {
    this.options = {
      ...this.options,
      ...testOptions
    }
  }

  capture(
    input: string,
    testOptions?: CursorTestOptions
  ): CaptureResult {
    return this.inlineInternal(input, {
      ...this.options,
      ...(testOptions || {})
    })
  }

  inline(strings: TemplateStringsArray): CaptureResult {
    return this.inlineInternal(
      trimNewLine(strings.join('')),
      this.options
    )
  }

  private inlineInternal(
    input: string,
    testOptions?: CursorTestOptions
  ): CaptureResult {
    const cursor = Cursor.from(input)

    let offset = 0
    const indexes: number[] = []
    const names: (string | undefined)[] = []
    const chunks: string[] = []

    const { prefix, noLabel } = {
      prefix: '🌵',
      noLabel: false,
      ...testOptions
    }
    const prefixLen = prefix.length

    const marker = cursor.clone()

    while (!cursor.isEof()) {
      if (cursor.startsWith(prefix)) {
        indexes.push(cursor.index - offset)
        chunks.push(marker.takeUntil(cursor))
        marker.moveTo(cursor)

        cursor.next(prefixLen)

        if (!noLabel) {
          const name = parseLabel(cursor)

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

        offset += cursor.index - marker.index
        marker.moveTo(cursor)
      } else {
        cursor.next(1)
      }
    }

    chunks.push(marker.takeUntil(cursor))
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
              cursors.filter((_cursor, index) => !names[index])
            )
    }
  }

  trimNewLine(strings: TemplateStringsArray) {
    return trimNewLine(strings.join())
  }
}

export const t = new CursorTest()
