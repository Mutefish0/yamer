const fs = require('fs')
const os = require('os')
const path = require('path')
const { ipcMain } = require('electron')

module.exports = {
    check () {
        const homedir = os.homedir()
        const rootPath = path.join(homedir, '.yamer/')
        const rootMdPath = path.join(homedir, '.yamer/root')

        if (!fs.existsSync(rootPath)) {
            fs.mkdir(rootPath)
        }

        if (!fs.existsSync(rootMdPath)) {
            const initialMd = fs.readFileSync(path.join(__dirname, '../config/root.md'))
            fs.writeFileSync(rootMdPath, initialMd)
        }

        return fs.readFileSync(rootMdPath, { encoding: 'utf8' })
    }
}