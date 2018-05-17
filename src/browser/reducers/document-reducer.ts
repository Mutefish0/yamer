import * as documentActions from 'browser/actions/document-actions'
import ActionType from 'browser/actions'
import { Document as IDocument } from 'common/cross'

export interface DocumentState {
    list: IDocument[]
}

const defaultState: DocumentState = {
    list: []
}

export default (state = defaultState, action: 
    documentActions.DOCUMENT_ACTION
) => {
    switch (action.type) {
        case ActionType.DOCUMENT_FULFIL_FETCH_ALL:
            return {...state, list: action.documents }

        default:
            return state
    }
}

