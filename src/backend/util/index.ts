import { IncomingMessage } from 'http'
import { Stream } from 'stream'

type Reducer<T, P> = (prev: T, curr: P) => T
type ReduceStream<T, P> = (stream: Stream, reducer: Reducer<T, P>, defaultValue: T) => Promise<T>

export const reduceStream: ReduceStream<any, any> = (
    stream, reducer, defaultValue
) => new Promise((resolve, reject) => {
    let lastValue = defaultValue
    stream.on('data', chunk => {
        lastValue = reducer(lastValue, chunk)
    })
    stream.on('end', () => resolve(lastValue))
    stream.on('error', error => reject(error))
})

const concat = (prev, curr) => (prev + curr)

export function responseBodyText (resp: IncomingMessage) {
    return reduceStream(resp, concat, '')
}

export async function responseBodyJSON (resp: IncomingMessage) {
    const str = await reduceStream(resp, concat, '')
    return JSON.parse(str)
}

import os from 'os'
import path from 'path'
import { Document } from 'common/cross'

const level = require('level')
const dbPath = path.join(os.homedir(), '.yamer/db')

export const openDatabase = () => {
    return level(dbPath, { valueEncoding: 'json' })
}

export const documentKey = id => `document~${id}`
export const documentMetaKey = id => `documentMeta~${id}`
