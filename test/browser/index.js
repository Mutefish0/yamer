const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let mainURL = url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
})

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1080, height: 760, show: true })

    // and load the index.html of the app.
    mainWindow.loadURL(mainURL)

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit()
})

app.dock.hide()

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

process.stdout.on('data', function (data) {
    if (data == 'reload') {
        mainWindow.loadURL(mainURL)
    }
})
