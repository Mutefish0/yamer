let gulp = require('gulp')
let exec = require('child_process').exec
let spawn = require('child_process').spawn

let electron = require('electron')

gulp.task('rollup-watch', cb => {
    let child = exec('rollup -c -w', err => { 
        if (err) {
            cb()
            console.log(err)
        } else {
            cb()
        }
    })
    child.stderr.on('data', data => {
        if (data.indexOf('created') == 0) {
            gulp.start('electron-reload')
        }    
    })
})


let electron_process
gulp.task('electron-reload', cb => {
    // 通过stdout向electron发送刷新页面的消息
    if (electron_process) {
        electron_process.stdout.write(JSON.stringify({ command: 'reload' }))
    }
    cb()
})

gulp.task('electron', cb => {
    let child = spawn(electron, ['.'], { stdio: 'pipe' })
    child.on('close', code => {
        process.exit(code)
    })
    electron_process = child
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

gulp.task('default', ['electron', 'rollup-watch'])