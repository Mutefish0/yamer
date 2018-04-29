import URLPattern from 'url-pattern'
import { LevelUp } from 'levelup';

export const port = 26303
export const domain = `http://localhost:${port}`

export interface Respnose {
    error?: string
    result: JSON
}

export const systemActionPatterns = {
    'setup': new URLPattern('/setup')
}

export const pullActionPatterns = {
    'document': new URLPattern('/doc(/:id)'),
    'new': new URLPattern('/new'),
    'list': new URLPattern('/list')
}

export const pushActionPatterns = {
    'save': new URLPattern('/doc(/:id)/save'),
    'delete': new URLPattern('/doc(/:id)/delete')
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
    deprecated?: boolean
    readOnly?: boolean
    createSince?: number
    lastModify?: number
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
