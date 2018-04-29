const gulp = require('gulp')
const exec = require('child_process').exec
const spawn = require('child_process').spawn
const livereload = require('livereload')
const sass = require('gulp-sass')
const concat = require('gulp-concat')

const electron = require('electron')

gulp.task('rollup-watch', cb => {
    let child = exec('rollup -c -w', err => { 
        if (err) {
            cb()
            console.log(err)
        } else {
            cb()
        }
    })
})

gulp.task('electron', cb => {
    let child = spawn(electron, ['dist/platform'], { stdio: 'pipe' })
    child.on('close', code => {
        process.exit(code) 
    })
    cb()
})

// ------------ browser --------------
gulp.task('copy-assets', () => {
    gulp.src('src/browser/assets/**/*.*')
    .pipe(gulp.dest('dist/browser/assets/'))
})

gulp.task('sass', () => {
    gulp.src('src/browser/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist/browser/'))
})

gulp.task('watch:sass', () => {
    gulp.watch('src/browser/**/*.scss', ['sass'])
})

gulp.task('livereload', () => {
    const server = livereload.createServer({ port: 7001 })
    server.watch(__dirname + '/dist/browser/')
})
// ------------- platform -------------------


gulp.task('default', ['electron', 'livereload', 'rollup-watch', 'watch:sass', 'copy-assets'])