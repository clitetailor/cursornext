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
        sourcemap: true,
        sourcemapFile: 'cursornext.umd.js.map',
        entryFileNames: 'cursornext.umd.js'
      },
      plugins: [
        typescript({
          tsconfigOverride: {
            compilerOptions: {
              module: 'es2015'
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
