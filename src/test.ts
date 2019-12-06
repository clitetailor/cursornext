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
    return new CaptureResult(
      doc,
      this.indexes.sort((a, b) => a[1] - b[1])
    )
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
      ([, index]) =>
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

    for (const [, index] of indexes) {
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
    const list: [string, number][] = []

    for (const [label, index] of indexes) {
      const matchResult = label.match(/(start|end)\s*\((.*)\)/)

      if (matchResult) {
        const [, prefix, label] = matchResult

        if (prefix === 'start') {
          list.unshift([label, index])
        } else {
          const itemIndex = list.findIndex(
            ([lastLabel]) => lastLabel === label
          )

          if (itemIndex !== -1) {
            const [[, lastIndex]] = list.splice(itemIndex, 1)

            const start = new Cursor({
              doc,
              index: lastIndex
            })
            const end = new Cursor({
              doc,
              index
            })

            pairs.push({
              label,
              start,
              end
            })
          }
        }
      } else {
        if (stack.length) {
          const [lastLabel, lastIndex] = stack[stack.length - 1]

          if (label === lastLabel) {
            const start = new Cursor({
              doc,
              index: lastIndex
            })
            const end = new Cursor({
              doc,
              index
            })

            pairs.push({
              label,
              start,
              end
            })

            stack.pop()
          } else {
            stack.push([label, index])
          }
        } else {
          stack.push([label, index])
        }
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
  private _options: CursorTestOptions

  constructor(options?: CursorTestOptions) {
    this._options = options || {
      prefix: '🌵',
      noLabel: false
    }
  }

  config(testOptions: CursorTestOptions) {
    this._options = {
      ...this._options,
      ...testOptions
    }
  }

  options(testOptions: CursorTestOptions) {
    return new CursorTest({
      ...this._options,
      ...testOptions
    })
  }

  capture(
    input: string,
    testOptions?: CursorTestOptions
  ): CaptureResult {
    return this._inline(input, {
      ...this._options,
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

  block(
    input: string,
    _testOptions: CursorTestOptions = {}
  ): CaptureResult {
    const cursor = Cursor.from(input)
    const chunks = []

    const buffer = new CaptureBuffer()
    let offset = 0
    let lineLen = 0

    while (!cursor.isEof()) {
      const regexpArray = cursor.exec(
        /^[ \t]*([0-9]+)?[ \t]*\|[ \t](.*?)$/gmy
      )

      if (regexpArray) {
        const lineNumber = regexpArray[1]
        const line = regexpArray[2] + '\n'

        if (lineNumber) {
          offset += lineLen

          chunks.push(line)
          lineLen = line.length
        } else {
          if (!line.match(/\s*\^/)) {
            const matchResult = line.match(/([\s|]*)(.*)/)

            if (matchResult) {
              const index = offset + matchResult[1].length
              const label = matchResult[2].trim()

              buffer.add(label, index)
            }
          }
        }

        cursor.setIndex(
          regexpArray.index + regexpArray[0].length
        )
      } else {
        cursor.next(1)
      }
    }

    return buffer.toCaptureResult(chunks.join(''))
  }

  trim(input: string) {
    return input
      .replace(/^[ \t]*?\r?\n/, '')
      .replace(/\r?\n[ \t]*?$/, '')
  }
}

export const t = new CursorTest()
