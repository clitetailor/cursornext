import { src, task, dest, series } from 'gulp'
import ts from 'gulp-typescript'
import del from 'del'
import rename from 'gulp-rename'
import { rollup } from 'rollup'

import { default as getRollupConfig } from './rollup.config'

task('build:cjs', () => {
  const tsProject = ts.createProject('tsconfig.json', {
    declaration: true
  })

  return src('src/**/*.ts')
    .pipe(tsProject())
    .js.pipe(dest('.'))
})

task('build:umd', async () => {
  const buildPlans = getRollupConfig({
    format: ['umd']
  })

  for (const buildPlan of buildPlans) {
    const bundle = await rollup(buildPlan)

    await bundle.write(buildPlan.output)
  }
})

task('build:esm', () => {
  const tsProject = ts.createProject('tsconfig.json', {
    target: 'esnext',
    module: 'esnext'
  })

  return src('src/**/*.ts')
    .pipe(tsProject())
    .js.pipe(
      rename({
        suffix: '.esm'
      })
    )
    .pipe(dest('.'))
})

export const build = series(
  'build:cjs',
  'build:umd',
  'build:esm'
)

export const clean = () => {
  return del([
    '**/*.js',
    '**/*.d.ts',
    '!node_modules',
    '!gulpfile.esm.js',
    '!babel.config.js',
    '!rollup.config.js'
  ])
}