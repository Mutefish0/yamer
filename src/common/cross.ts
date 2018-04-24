import URLPattern from 'url-pattern'

export const port = 26303
export const domain = `http://localhost:${port}`

export interface Respnose {
    error?: string
    result: JSON
}

interface Document {
    id: string
    content: string
}

export const systemActionPatterns = {
    'setup': new URLPattern('/setup')
}

export const pullActionPatterns = {
    'document': new URLPattern('/doc(/:id)'),
    'new': new URLPattern('/new')
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
