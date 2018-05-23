import { Action } from 'redux'
import ActionType from 'browser/actions'
import * as historyActions from 'browser/actions/history-actions'

export interface HistoryState {
    lastReadId: string
    lastWriteId: string
    writeMode: 'normal' | 'live'
}

const defaultState: HistoryState = {
    lastReadId: 'empty',
    lastWriteId: 'empty',
    writeMode: 'normal'
}

export default (state = defaultState, action: historyActions.HISTORY_ACTION) => {
    switch (action.type) {
        case ActionType.HISTORY_SET_LAST_READ_ID:
            return {...state, lastReadId: action.id}
        case ActionType.HISTORY_SET_LAST_WRITE_ID:
            return {...state, lastWriteId: action.id}
        case ActionType.HISTORY_TOGGLE_WRITE_MODE:
            return {...state, writeMode: state.writeMode == 'live' ? 'normal' : 'live'}
        default:
            return state
    }
}