import React from 'react'

export interface Document {
    id: string
    content: string
    readOnly?: boolean
    createSince?: number
    lastModify?: number   
}

const DocumentContext = React.createContext({
    id: '',
    content: ''
})

export default DocumentContext