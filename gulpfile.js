const gulp = require('gulp')
const clean = require('gulp-clean')
const runSequence = require('run-sequence')
const path = require('path')
const packager = require('electron-packager')

gulp.task('clean', function () {
    return gulp.src('dist')
        .pipe(clean())
})

gulp.task('copy', function () {
    return gulp.src('src/platform/**/*.*')
        .pipe(gulp.dest('dist/platform'))
})

gulp.task('pack', function () {
    return packager({
        icon: 'app.icns',
        dir: '.',
        out: 'release',
        ignore: [
            'webpack', 'src', 'markdown-cc', 'libs', 'release',
            'index.html', 'global.d.ts', 'gulpfile', 'tsconfig.json',
            'tsconfig.backend.json',
            'yarn', '.vscode', '.gitignore', 'README.md', 'app.icns'
        ].map(f => `^/${f}`),
        asar: true
    })
})

gulp.task('build', function () {
    return runSequence('clean', 'copy')
})