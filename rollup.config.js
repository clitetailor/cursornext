import typescript from 'rollup-plugin-typescript2'

export default (options) => {
  const buildPlans = []

  if (format(options, 'umd')) {
    buildPlans.push({
      input: 'src/index.ts',
      output: {
        dir: '.',
        format: 'umd',
        name: 'cursornext',
        entryFileNames: '[name].[format].js'
      },
      plugins: [
        typescript({
          tsconfigOverride: {
            compilerOptions: {
              module: 'es2015',
              declaration: true
            }
          }
        })
      ]
    })
  }

  return buildPlans
}

function format(options, formatType) {
  return (
    options &&
    options.format &&
    (options.format === formatType ||
      (Array.isArray(options.format) &&
        options.format.includes(formatType)))
  )
}
