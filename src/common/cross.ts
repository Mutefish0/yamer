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

export const patterns = {
    'setup': new URLPattern('/setup'),
    'document': new URLPattern('/pull/doc(/:id)'),
    'save': new URLPattern('/push/doc(/:id)/save'),
    'new': new URLPattern('/pull/new')
}

