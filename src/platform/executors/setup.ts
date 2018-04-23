import fs from 'fs'
import os from 'os'
import path from 'path'

const level = require('level')
 
export default async function () {
    const homedir = os.homedir()
    const rootPath = path.join(homedir, '.yamer/')
    const dbPath = path.join(rootPath, 'db')

    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath)
    }

    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath)
    }

    const indexDB = await level(path.join(dbPath, 'index'), { valueEncoding: 'json' })
    const documentDB = await level(path.join(dbPath, 'document'))

    try {
        const homelist = await indexDB.get('homelist')
    } catch (error) {
        if (error.type == 'NotFoundError') {
            const timestamp = new Date().getTime()
            await indexDB.put('homelist', { 
                readOnly: true, createSince: timestamp,
                lastModify: timestamp
            })
            await documentDB.put('homelist', `# 文档列表`)
        } else {
            throw error
        }
    } finally {
        indexDB.close()
        documentDB.close()
    }

    return {}
}