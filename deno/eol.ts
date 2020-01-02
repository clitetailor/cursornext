export enum EolType {
  CR = '\r',
  LF = '\n',
  CRLF = '\r\n',
  EOF = ''
}

export class Eol {
  type: EolType
  start: number
  end: number

  constructor(
    start: number,
    end: number,
    type: EolType = EolType.LF
  ) {
    this.type = type
    this.start = start
    this.end = end
  }
}
