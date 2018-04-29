import { openDatabase, documentKey } from 'backend/util'

export default  async function ({ id }) {
    const db = await openDatabase()
    const doc = await db.get(documentKey(id))
    await db.close()
    return doc
}