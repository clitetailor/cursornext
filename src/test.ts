import { Cursor } from './cursor'
import { parseLabel } from './utils/label'
import { trimNewLine } from './utils/string'

export interface CursorTestOptions {
  prefix?: string
  noLabel?: boolean
}

export class CaptureBuffer {
  constructor(private map: Map<string, number[]> = new Map()) {}

  add(label: string, index: number) {
    if (!this.map.has(label)) {
      this.map.set(label, [index])
    } else {
      const indexes = <number[]>this.map.get(label)

      indexes.push(index)
    }
  }

  toCaptureResult(doc: string) {
    return new CaptureResult(doc, this.map)
  }
}

export class CaptureResult {
  constructor(
    private doc: string,
    private map: Map<string, number[]> = new Map()
  ) {}

  setDoc(doc: string) {
    this.doc = doc
  }

  toMap(): CaptureMap {
    const result: CaptureMap = {}
    const map = this.map
    const doc = this.doc

    for (const label of map.keys()) {
      const index = (<number[]>map.get(label))
        .sort()
        .reverse()[0]

      result[label] = new Cursor({
        doc,
        index
      })
    }

    return result
  }

  toIter(): CaptureIterable {
    let cursors: Cursor[] = []
    const doc = this.doc

    for (const indexes of this.map.values()) {
      cursors = cursors.concat(
        indexes.map(
          index =>
            new Cursor({
              doc,
              index
            })
        )
      )
    }

    cursors = cursors.sort((a, b) => a.index - b.index)

    return new CaptureIterable(cursors)
  }
}

export interface CaptureMap {
  [name: string]: Cursor
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
              buffer.add('', captureIndex)
              break
            case 'symbol':
              chunks.push(prefix)
              break
            default:
              buffer.add(label, captureIndex)
              break
          }
        } else {
          buffer.add('', captureIndex)
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

  trimNewLine(strings: TemplateStringsArray) {
    return trimNewLine(strings.join())
  }
}

export const t = new CursorTest()
