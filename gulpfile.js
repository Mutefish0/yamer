let gulp = require('gulp')
let exec = require('child_process').exec
let spawn = require('child_process').spawn

let electron = require('electron')

let commands = {
    'tsc': 'tsc src/main.ts -m es2015 --outDir dist -w',
    'rollup': 'rollup dist/main.js --format iife --output dist/bundle.js'
}

gulp.task('tsc-watch', function (cb) {
    let child = exec(commands.tsc, function (err) {
        if (err) {
            console.log(err)
        } else {
            cb()
        }
    }) 

    child.stdout.on('data', function (data) {
        if (data.indexOf('Compilation complete' > -1)) {
            gulp.start('electron-reload')
        }
    })

})

gulp.task('rollup', function (cb) {
    exec(commands.rollup, function (err) {
        if (err) {
            console.log(err)
        } else {
            cb()
        }
    })
})


let electron_process
gulp.task('electron-reload', ['rollup'], function (cb) {
    // 通过stdout向electron发送刷新页面的消息
    if (electron_process) {
        electron_process.stdout.write('reload')
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

gulp.task('default', ['electron', 'tsc-watch'])