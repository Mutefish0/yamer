import { combineReducers } from 'redux'

import appReducer, { AppState } from './app-reducer'
import documentReducer, { DocumentState } from './document-reducer'
import historyReducer, { HistoryState } from './history-reducer'
import { routerReducer, RouterReducer } from 'react-router-redux'

export interface State {
    app: AppState
    document: DocumentState
    history: HistoryState
    router: RouterReducer
}

const reducer = combineReducers({
    app: appReducer,
    document: documentReducer,
    history: historyReducer,
    router: routerReducer
})

export default reducer
