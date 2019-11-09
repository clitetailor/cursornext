import test from 'ava'
import {
  t as cursorTest,
  CaptureResult
} from '../src'
import { runInlineTest, runCaptureTest } from './helpers/runner'

test('`capture` should works probably', t => {
  const testcases: [CaptureResult, string][] = [
    [
      cursorTest.capture(
        cursorTest.trimNewLine`
This is an example how inline syntax works!
  Here 🌵 is an cactus! 🌵(symbol)
        `
      ),
      cursorTest.trimNewLine`
This is an example how inline syntax works!
  Here  is an cactus! 🌵
      `
    ]
  ]

  for (const testcase of testcases) {
    runCaptureTest(t, ...testcase)
  }
})

test('`inline` should works probably', t => {
  const testcases: [CaptureResult, string][] = [
    [
      cursorTest.inline`
This is an example how inline syntax works!
  Here 🌵 is an cactus! 🌵(symbol)
      `,
      cursorTest.trimNewLine`
This is an example how inline syntax works!
  Here  is an cactus! 🌵
      `
    ]
  ]

  for (const testcase of testcases) {
    runInlineTest(t, ...testcase)
  }
})
