import * as documentActions from 'browser/actions/document-actions'
import ActionType from 'browser/actions'
import { Document as IDocument } from 'common/cross'

export interface DocumentState {
    list: IDocument[]
    currentDocument?: IDocument
    isFetchingDocument: boolean
    isFetchingDocumentList: boolean
}

const defaultState: DocumentState = {
    list: [],
    currentDocument: null,
    isFetchingDocument: false,
    isFetchingDocumentList: false 
}

export default (state = defaultState, action: 
    documentActions.DOCUMENT_ACTION
) => {
    switch (action.type) {
        case ActionType.DOCUMENT_START_FETCH_ALL:
            return {...state, isFetchingDocumentList: true}
        case ActionType.DOCUMENT_FULFIL_FETCH_ALL:
            return {...state, list: action.documents, isFetchingDocumentList: false }
        case ActionType.DOCUMENT_START_FETCH:
            return {...state, isFetchingDocument: true }
        case ActionType.DOCUMENT_FULFIL_FETCH:
            return {
                ...state, 
                currentDocument: action.document, isFetchingDocument: false
            }
        case ActionType.DOCUMENT_START_DROP:
            if (action.id == state.currentDocument.id) {
                return {...state, currentDocument: null}
            } else return state 
        default:
            return state
    }
}

