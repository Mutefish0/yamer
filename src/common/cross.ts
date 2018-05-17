import URLPattern from 'url-pattern'
import { LevelUp } from 'levelup';

export const port = 26303
export const domain = `http://localhost:${port}`

export interface Response {
    error?: string
    result: any
}

export const systemActionPatterns = {
    'setup': new URLPattern('/api/setup')
}

export const pullActionPatterns = {
    'document': new URLPattern('/api/doc(/:id)'),
    'new': new URLPattern('/api/new'),
    'list': new URLPattern('/api/list')
}

export const pushActionPatterns = {
    'save': new URLPattern('/api/doc(/:id)/save'),
    'delete': new URLPattern('/api/doc(/:id)/delete')
} 

export const actionPatterns = Object.assign(
    {}, systemActionPatterns, pullActionPatterns, 
    pushActionPatterns
)

export function matchPattern (path, patterns=actionPatterns) {
    let match 
    for (let key in patterns) {
        if (match = patterns[key].match(path)) {
            return match
        }
    }
    return null
}

export interface Document {
    id: string
    title: string
    content: string
    deprecated: boolean
    readOnly: boolean
    createSince: number
    lastModify: number
}

export interface DocumentMeta {
    id: string
    title: string
    lastModify: number
}


export interface DocumentLike {
    content: string
    title: string
}
