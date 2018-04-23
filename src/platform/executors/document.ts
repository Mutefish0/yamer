import os from 'os'
import path from 'path'

const level = require('level')

const homedir = os.homedir()
const dbPath = path.join(homedir, '.yamer/db')

export default  async function ({ id }) {
    const indexDB = await level(path.join(dbPath, 'index'), { valueEncoding: 'json' })
    const documentDB = await level(path.join(dbPath, 'document'))

    try { 
        const index = await indexDB.get(id)        
        const content = await documentDB.get(id)        

        return Object.assign(index, { content })
    } catch (error) {
        throw error
    } finally {
        indexDB.close()
        documentDB.close()
    }
}