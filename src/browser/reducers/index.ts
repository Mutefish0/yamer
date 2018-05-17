import { combineReducers } from 'redux'

import appReducer, { AppState } from './app-reducer'
import documentReducer, { DocumentState } from './document-reducer'

export interface State {
    app: AppState,
    document: DocumentState
}

const reducer = combineReducers({
    app: appReducer,
    document: documentReducer
})

export default reducer
