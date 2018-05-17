import { Action } from 'redux'
import * as appActions from '../actions'
import ActionType from '../actions'

export interface AppState {
    isSetupFulfiled: boolean
}

const defaultState: AppState = {
    isSetupFulfiled: false
}

export default (state=defaultState, action: Action) => {
    switch (action.type) {
        case ActionType.APP_FULFIL_SETUP:
            return { ...state, isSetupFulfiled: true }
        default:
            return state
    }
}