import { openDatabase, reduceStream, documentMetaKey } from 'backend/util'

export default async function () {
    const db = await openDatabase()
    const stream = db.createValueStream({ 
        gt: documentMetaKey(''), lt: documentMetaKey('~')
    })
    const list = await reduceStream(stream, (prev, curr) => { 
        prev.push(curr)
        return prev
    }, [])
    await db.close()
    return list
}