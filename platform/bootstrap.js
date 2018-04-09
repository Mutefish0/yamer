const { ipcMain } = require('electron')
const fileChecker = require('./file-checker')

ipcMain.on('renderer_started', event => {
    const md = fileChecker.check()
    event.sender.send('bootstrap_success', md)
})

module.exports = {}