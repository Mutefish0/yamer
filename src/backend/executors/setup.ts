import fs from 'fs'
import os from 'os'
import path from 'path'
 
import { openDatabase } from 'backend/util'

export default async function () {
    const rootPath = path.join(os.homedir(), '.yamer/')
    const dbPath = path.join(rootPath, 'db')

    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath)
    }

    if (!fs.existsSync(dbPath)) {
        const db = await openDatabase()
        await db.close()
    }

    return {}
}