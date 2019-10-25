import { Config } from 'bili'

const config: Config = {
  plugins: {
    typescript2: {
      // Override the config in `tsconfig.json`
      tsconfigOverride: {
        include: ['src']
      }
    }
  },

  // Let's take this opportunity to move the CLI flags here as well
  input: 'src/index.ts',
  output: {
    dir: '.',
    format: ['cjs', 'esm']
  }
}

export default config
