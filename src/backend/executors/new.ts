import { openDatabase, documentKey, documentMetaKey } from 'backend/util'
import { Document, DocumentMeta } from 'common/cross' 
import cuid from 'cuid'

export default async function () {
    const db = await openDatabase()
    const id = cuid()
    const docKey = documentKey(id)
    const docMetaKey = documentMetaKey(id)
    const lastModify = new Date().getTime()

    const newDoc: Document = {
        id, title: '', content: '', readOnly: false, 
        lastModify, createSince: lastModify
    }

    const newDocMeta: DocumentMeta = {
        id, title: '', lastModify, deprecated: false
    }

    await db.batch([
        { type: 'put', key: docKey, value: newDoc },
        { type: 'put', key: docMetaKey, value: newDocMeta },
    ])

    await db.close()

    return newDoc
}