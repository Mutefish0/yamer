

import { responseBodyJSON, openDatabase, documentKey, documentMetaKey } from 'backend/util'
import { Document, DocumentLike, DocumentMeta } from 'common/cross'

export default async function ({ id }, req) {
    const db = await openDatabase()
    const docKey = documentKey(id)
    const docMetaKey = documentMetaKey(id)
    
    const docUpdate = await responseBodyJSON(req) as DocumentLike
    const doc = await db.get(docKey) as Document
    
    const latestDoc = Object.assign({}, doc, {
        title: docUpdate.title, content: docUpdate.content, 
        lastModify: new Date().getTime()
    })

    await db.put(docKey, latestDoc)
    await db.put(docMetaKey, {
        id: latestDoc.id, title: latestDoc.title, lastModify: latestDoc.lastModify
    })
    await db.close()

    return latestDoc
}