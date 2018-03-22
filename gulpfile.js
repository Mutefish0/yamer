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
    let child = spawn(electron, ['.'], { stdio: 'pipe' })
    child.on('close', code => {
        process.exit(code) 
    })
    cb()
})

function rollupTest () {
    return new Promise((resolve, reject) => {
        exec('rollup -c --format iife --input test/browser/test.ts -o dist/test.js',  err => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

gulp.task('browser-test', cb => {
    rollupTest().then(() => {
        let child = spawn(electron, ['test/browser/index.js'], { stdio: 'pipe' })
        child.on('close', code => {
            process.exit(code)
            cb()
        })
        child.stdout.on('data', data => {
            if (data == 'recompile') {
                rollupTest().then(() => {
                    child.stdout.write('reload')
                })
            }
        })

    }, (err) => {
        cb()
        console.log(err)
    })
})

gulp.task('copy-assets', () => {
    gulp.src('src/assets/**/*.*')
    .pipe(gulp.dest('dist/assets/'))
})

gulp.task('sass', () => {
    gulp.src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist/'))
})

gulp.task('watch:sass', () => {
    gulp.watch('src/**/*.scss', ['sass'])
})

gulp.task('livereload', () => {
    const server = livereload.createServer({ port: 7001 })
    server.watch(__dirname + '/dist/')
})

gulp.task('default', ['electron', 'livereload', 'rollup-watch', 'watch:sass', 'copy-assets'])