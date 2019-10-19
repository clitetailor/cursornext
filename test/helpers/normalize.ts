export function trimNewLine(input: string): string {
  return input.replace(/^.*?\r?\n/, '').replace(/\r?\n.*?$/, '')
}
