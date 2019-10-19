import test from 'ava'
import {
  runLocTest,
  runGetLineTest,
  runPrintDebugTest
} from './helpers/runner'

test('`getLoc` should work probably', t => {
  const testcases: [string, number, number][] = [
    [
      `
Hello, World!
This is an example 🌵\`getLoc\` test.
      `,
      2,
      20
    ],
    [
      `
The following loc should refer to line 1 and column 56.🌵
      `,
      1,
      56
    ]
  ]

  for (const testcase of testcases) {
    runLocTest(t, ...testcase)
  }
})

test('`getLine` should work probably', t => {
  const testcases: [string, string][] = [
    [
      `


Hello, World!
This is an example 🌵\`getLoc\` test.
      `,
      `
3 | Hello, World!
4 | This is an example \`getLoc\` test.
      `
    ]
  ]

  for (const testcase of testcases) {
    runGetLineTest(t, ...testcase)
  }
})

test('`printDebug` should work probably', t => {
  const testcases: [string, string][] = [
    [
      `


Hello, World!
This is an example 🌵\`getLoc\` test.
      `,
      `
3 | Hello, World!
4 | This is an example \`getLoc\` test.
  |                    ^
      `
    ]
  ]

  for (const testcase of testcases) {
    runPrintDebugTest(t, ...testcase)
  }
})
