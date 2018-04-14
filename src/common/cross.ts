
export interface BrowserRequest {
    command: string
    data: { [key: string]: string | number }
}


export interface PlatformRespnose {
    error?: string
    result: { [key: string]: string | number }
}

const port = 26303
const cross = { port }

export type Command = 'setup' | 'save' | 'fetch'

export default cross
