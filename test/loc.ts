import test from 'ava'
import { runLocTest } from './helpers/runner'

test('`getLoc` should work probably', t => {
  const testcases: [string, number, number][] = [
    [
      `
Hello, World!
This is an example 🌵\`getLoc\` test.
      `,
      3,
      20
    ],
    [
      `
The following loc should refer to line 2 and column 53.🌵
      `,
      2,
      56
    ]
  ]

  for (const testcase of testcases) {
    runLocTest(t, ...testcase)
  }
})
