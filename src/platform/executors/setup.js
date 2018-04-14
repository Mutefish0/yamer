import fs from 'fs'
import os from 'os'
import path from 'path'

export default async function () {
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