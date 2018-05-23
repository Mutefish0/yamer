import { openDatabase, documentMetaKey } from 'backend/util'
import { DocumentMeta } from 'common/cross' 

export default async ({ id }) => {
    const db = await openDatabase()
    const docMetaKey = documentMetaKey(id)
    const docMeta: DocumentMeta = await db.get(docMetaKey)
    docMeta.deprecated = true
    db.put(docMetaKey, docMeta) 
    await db.close()
    return {}
}