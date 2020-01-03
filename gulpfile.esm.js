import { src, task, dest, series } from 'gulp'
import del from 'del'
import fs from 'fs-extra'
import ts from 'gulp-typescript'
import path from 'path'
import merge from 'merge-stream'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import sourcemaps from 'gulp-sourcemaps'
import { rollup } from 'rollup'

import { default as getRollupConfig } from './rollup.config'

const reporter = ts.reporter.fullReporter(true)

task('build:cjs', async () => {
  const tsProject = ts.createProject('tsconfig.json', {
    declaration: true
  })

  await fs.outputFile(
    path.resolve(__dirname, 'cjs/package.json'),
    JSON.stringify(
      {
        type: 'commonjs'
      },
      null,
      2
    ) + '\n'
  )

  const result = src('src/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProject(reporter))

  return merge(
    result.js
      .pipe(addImportExt('cjs'))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('cjs')),
    result.dts.pipe(addImportExt('dts')).pipe(dest('cjs'))
  )
})

task('build:esm', async () => {
  const tsProject = ts.createProject('tsconfig.json', {
    target: 'esnext',
    module: 'esnext',
    declaration: true
  })

  await fs.outputFile(
    path.resolve(__dirname, 'esm/package.json'),
    JSON.stringify(
      {
        type: 'module'
      },
      null,
      2
    ) + '\n'
  )

  const result = src('src/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProject(reporter))

  return merge(
    result.js
      .pipe(addImportExt('esm'))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('esm')),
    result.dts.pipe(addImportExt('dts')).pipe(dest('esm'))
  )
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

task('build:deno', async () => {
  return src('src/**/*.ts')
    .pipe(
      rename(path => {
        if (path.basename === 'index') {
          return {
            ...path,
            basename: 'mod'
          }
        }

        return path
      })
    )
    .pipe(addImportExt('deno'))
    .pipe(dest('deno'))
})

export const build = series(
  'build:cjs',
  'build:esm',
  'build:umd',
  'build:deno'
)

export const clean = () => {
  return del([
    'cjs',
    'esm',
    'deno',
    '*.umd.js',
    '*.map',
    '!node_modules'
  ])
}

function addImportExt(type) {
  switch (type) {
    case 'esm':
    case 'dts':
      return replace(
        /(from\s+["'])([^"']*)(["'])/g,
        '$1$2.js$3'
      )

    case 'deno':
      return replace(
        /(from\s+["'])([^"']*)(["'])/g,
        '$1$2.ts$3'
      )

    default:
      return replace(
        /(require\(["'])([^"']+)(["']\))/g,
        '$1$2.js$3'
      )
  }

  return replace(
    type === 'esm' || type === 'dts'
      ? /(from\s+["'])([^"']*)(["'])/g
      : /(require\(["'])([^"']+)(["']\))/g,
    '$1$2.js$3'
  )
}
