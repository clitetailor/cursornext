import { Config } from 'bili'

const config: Config = {
  plugins: {
    typescript2: {
      tsconfigOverride: {
        include: ['src']
      }
    }
  },
  input: 'src/index.ts',
  output: {
    dir: '.',
    format: ['cjs', 'umd', 'esm'],
    sourceMap: true,
    sourceMapExcludeSources: true
  }
}

export default config
