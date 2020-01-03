export interface LocLike {
  index: number
  line: number
  column: number
}

export class Loc {
  index: number
  line: number
  column: number

  constructor({ index, line, column }: LocLike) {
    this.index = index
    this.line = line
    this.column = column
  }
}
