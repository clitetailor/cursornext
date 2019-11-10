import { Cursor } from './cursor'
import { parseLabel } from './utils/label'

export interface CursorTestOptions {
  prefix?: string
  noLabel?: boolean
}

export class CaptureBuffer {
  indexes: [string, number][] = []

  add(label: string, index: number) {
    this.indexes.push([label, index])
  }

  toCaptureResult(doc: string) {
    return new CaptureResult(doc, this.indexes)
  }
}

export class CaptureResult {
  constructor(
    private doc: string,
    private indexes: [string, number][] = []
  ) {}

  toMap(): CaptureMap {
    const result: CaptureMap = {}
    const indexes = this.indexes
    const doc = this.doc

    for (const [label, index] of indexes) {
      result[label] = new Cursor({
        doc,
        index
      })
    }

    return result
  }

  toArray(): Cursor[] {
    const doc = this.doc

    return this.indexes.map(
      ([label, index]) =>
        new Cursor({
          doc,
          index
        })
    )
  }

  toIter(): CaptureIterable {
    const cursors: Cursor[] = []
    const doc = this.doc
    const indexes = this.indexes

    for (const [label, index] of indexes) {
      cursors.push(
        new Cursor({
          doc,
          index
        })
      )
    }

    return new CaptureIterable(cursors)
  }

  toPairs(): CapturePair[] {
    const pairs: CapturePair[] = []
    const indexes = this.indexes
    const doc = this.doc

    const stack: [string, number][] = []

    for (const [label, endIndex] of indexes) {
      const index = stack.findIndex(item => item[0] === label)

      if (index !== -1) {
        const [_, startIndex] = stack.splice(index, 1)[0]

        const start = new Cursor({
          doc,
          index: startIndex
        })
        const end = new Cursor({
          doc,
          index: endIndex
        })

        pairs.push({
          label,
          start,
          end
        })
      } else {
        stack.unshift([label, endIndex])
      }
    }

    return pairs
  }
}

export interface CaptureMap {
  [label: string]: Cursor
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
}

export interface CapturePair {
  label: string
  start: Cursor
  end: Cursor
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
    return this._inline(input, {
      ...this.options,
      ...(testOptions || {})
    })
  }

  inline(
    input: string,
    testOptions?: CursorTestOptions
  ): CaptureResult {
    return this._inline(this.trim(input), testOptions)
  }

  private _inline(
    input: string,
    testOptions?: CursorTestOptions
  ): CaptureResult {
    const cursor = Cursor.from(input)

    let offset = 0
    const buffer = new CaptureBuffer()
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
        const captureIndex = cursor.index - offset
        chunks.push(marker.takeUntil(cursor))
        marker.moveTo(cursor)

        cursor.next(prefixLen)

        if (!noLabel) {
          const label = parseLabel(cursor)

          switch (label) {
            case 'iter':
            case '':
              buffer.add('none', captureIndex)
              break
            case 'symbol':
              chunks.push(prefix)
              break
            default:
              buffer.add(label, captureIndex)
              break
          }
        } else {
          buffer.add('none', captureIndex)
        }

        offset += cursor.index - marker.index
        marker.moveTo(cursor)
      } else {
        cursor.next(1)
      }
    }

    chunks.push(marker.takeUntil(cursor))
    const doc = chunks.join('')

    return buffer.toCaptureResult(doc)
  }

  trim(input: string) {
    return input
      .replace(/^[ \t]*?\r?\n/, '')
      .replace(/\r?\n[ \t]*?$/, '')
  }
}

export const t = new CursorTest()
