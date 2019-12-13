import { Loc } from './loc'
import { Eol, EolType } from './eol'

export interface CursorStruct {
  doc: string
  index?: number
  end?: number
  eols?: Eol[]
}

export type CursorLike =
  | {
      doc: string
    }
  | string

export interface CursorPrintOptions {
  label?: string
}

export class Cursor {
  eols?: Eol[]
  doc: string
  index: number
  end?: number

  constructor({ doc, index, end }: CursorStruct) {
    this.doc = doc
    this.index = index || 0
    this.end = end
      ? end < doc.length
        ? end
        : undefined
      : undefined
  }

  static from(cursorLike: CursorLike): Cursor {
    if (typeof cursorLike === 'string') {
      return new Cursor({ doc: cursorLike })
    }

    const { doc } = cursorLike

    return new Cursor({ doc })
  }

  clone(options?: Partial<CursorStruct>): Cursor {
    return new Cursor({
      ...(this as CursorStruct),
      ...(options ? options : {})
    })
  }

  getLoc(): Loc {
    this.compute()

    let line = (<Eol[]>this.eols).findIndex(
      eol => this.index < eol.end
    )

    if (line === -1) {
      line = this.numberOfLines()
    }

    const column =
      this.index - (<Eol[]>this.eols)[line - 1].end + 1

    return new Loc({
      index: this.index,
      line,
      column
    })
  }

  extractLine(
    line: number,
    includeEol: boolean = false
  ): string | undefined {
    this.compute()

    if (line > 0 && line <= this.numberOfLines()) {
      const start = (<Eol[]>this.eols)[line - 1].end
      const end = includeEol
        ? (<Eol[]>this.eols)[line].end
        : (<Eol[]>this.eols)[line].start

      return this.doc.substring(start, end)
    }

    return
  }

  extractEol(line: number): Eol | undefined {
    this.compute()

    return (<Eol[]>this.eols)[line - 1]
  }

  numberOfLines(): number {
    this.compute()

    return (<Eol[]>this.eols).length - 1
  }

  compute() {
    if (!this.eols) {
      this.eols = [new Eol(0, 0)]

      const cursor = new Cursor({
        doc: this.doc,
        index: 0
      })

      while (!cursor.isEof()) {
        if (cursor.startsWith('\r\n')) {
          this.eols.push(
            new Eol(
              cursor.index,
              cursor.index + 2,
              EolType.CRLF
            )
          )
          cursor.next(2)
        } else if (cursor.startsWith('\r')) {
          this.eols.push(
            new Eol(cursor.index, cursor.index + 1, EolType.CR)
          )
          cursor.next(1)
        } else if (cursor.startsWith('\n')) {
          this.eols.push(
            new Eol(cursor.index, cursor.index + 1, EolType.LF)
          )
          cursor.next(1)
        } else {
          cursor.next(1)
        }
      }

      this.eols.push(
        new Eol(
          cursor.endIndex(),
          cursor.endIndex(),
          EolType.EOF
        )
      )
    }
  }

  endIndex(): number {
    return this.end || this.doc.length
  }

  setIndex(index: number) {
    if (index < 0) {
      this.index = 0

      return
    }

    const endIndex = this.endIndex()
    if (index > endIndex) {
      this.index = endIndex

      return
    }

    this.index = index
  }

  moveTo(cursor: Cursor) {
    this.setIndex(cursor.index)
  }

  next(offset: number) {
    if (offset < 1) {
      return
    }

    this.move(offset)
  }

  previous(offset: number) {
    if (offset < 1) {
      return
    }

    this.move(-offset)
  }

  move(offset: number) {
    this.setIndex(this.index + offset)
  }

  lookahead(len?: number): string {
    return this.doc.substring(
      this.index,
      len && this.index + len
    )
  }

  startsWith(compareString: string): boolean {
    const doc = this.doc

    for (
      let index = 0,
        docIndex = this.index,
        len = compareString.length;
      index < len;
      ++index, ++docIndex
    ) {
      if (doc[docIndex] !== compareString[index]) {
        return false
      }
    }

    return true
  }

  oneOf(compareStrings: string[]): string | undefined {
    for (const compareString of compareStrings) {
      if (this.startsWith(compareString)) {
        return compareString
      }
    }

    return undefined
  }

  exec(input: RegExp): RegExpExecArray | null {
    const regExp = input.global ? input : new RegExp(input)

    regExp.lastIndex = this.index

    return regExp.exec(this.doc)
  }

  isEof(): boolean {
    return this.index >= this.endIndex()
  }

  setEndIndex(index: number): Cursor {
    if (index <= this.endIndex()) {
      if (index < 0) {
        return this.clone({
          end: 0
        })
      }

      return this.clone({
        end: index
      })
    }

    return this.clone()
  }

  takeUntil(cursorOrIndex: Cursor | number): string {
    if (typeof cursorOrIndex === 'number') {
      return this.doc.substring(this.index, cursorOrIndex)
    }

    return this.doc.substring(this.index, cursorOrIndex.index)
  }

  isAt(cursorOrIndex: Cursor | number): boolean {
    const index =
      typeof cursorOrIndex === 'number'
        ? cursorOrIndex
        : cursorOrIndex.index

    return this.index === index
  }

  printDebug({ label }: CursorPrintOptions = {}): string {
    const loc = this.getLoc()
    const padLength = (loc.line + 1).toString().length

    const lines = []

    for (let i = -1; i < 2; ++i) {
      const lineNumber = loc.line + i
      const line = this.extractLine(lineNumber)

      if (line !== undefined) {
        const outputLine =
          lineNumber.toString().padStart(padLength) +
          ' | ' +
          line

        lines.push(outputLine)

        if (lineNumber === loc.line) {
          const markerLine =
            ''.padStart(padLength) +
            ' | ' +
            ' '.repeat(loc.column - 1) +
            '^'

          lines.push(markerLine)

          if (label) {
            const labelLine =
              ''.padStart(padLength) +
              ' | ' +
              ' '.repeat(loc.column - 1) +
              label

            lines.push(labelLine)
          }

          const emptyLine = ''.padStart(padLength) + ' | '

          lines.push(emptyLine)
        }
      }
    }

    return lines.join('\n')
  }
}
