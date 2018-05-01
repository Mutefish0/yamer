import React from 'react'

import { MAST } from 'libs/markdown'

import { Document } from 'common/cross'

export type Workmode = 'edit' | 'preview' | 'live'

export interface IWorkContext {
    ast: MAST
    source: string
    workmode: Workmode
    document?: Document
}

const defaultContext: IWorkContext = {
    ast: [],
    source: '',
    workmode: 'live',
    document: null 
}

const WorkContext = React.createContext(defaultContext)

export default WorkContext