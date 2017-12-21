let gulp = require('gulp')
let exec = require('child_process').exec
let spawn = require('child_process').spawn

let electron = require('electron')

gulp.task('rollup-watch', function (cb) {
    let child = exec('rollup -c -w', function (err) { 
        if (err) {
            cb()
            console.log(err)
        } else {
            cb()
        }
    })
    child.stderr.on('data', function (data) {
        if (data.indexOf('created') == 0) {
            gulp.start('electron-reload')
        }    
    })
})


let electron_process
gulp.task('electron-reload', function (cb) {
    // 通过stdout向electron发送刷新页面的消息
    if (electron_process) {
        electron_process.stdout.write(JSON.stringify({ command: 'reload' }))
    }
    cb()
})

gulp.task('electron', function (cb) {
    let child = spawn(electron, ['.'], { stdio: 'pipe' })
    child.on('close', function (code) {
        process.exit(code)
    })
    electron_process = child
    cb()
})

gulp.task('browser-test', function (cb) {
    exec('rollup -c --format iife --input test/browser/test.ts -o dist/test.js', function (err) {
        if (err) {
            cb()
            console.log(err)
        } else {
            let child = spawn(electron, ['test/browser/index.js'], { stdio: 'pipe' })
            child.on('close', function (code) {
                cb()
                process.exit(code)
            })
        }
    })
})

gulp.task('default', ['electron', 'rollup-watch'])