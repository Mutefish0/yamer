import { Epic } from './'
import ActionType from 'browser/actions'
import * as documentActions from 'browser/actions/document-actions'
import * as historyActions from 'browser/actions/history-actions'
import { push } from 'react-router-redux'
import { Observable } from 'rxjs'

// 成功创建后，重定向到该文档的编辑页
const redirectAfterCreateDocumentEpic: Epic<documentActions.DOCUMENT_FULFIL_CREATE> = action$ =>
	action$.ofType(ActionType.DOCUMENT_FULFIL_CREATE).map(action => push(`/write/${action.document.id}`))

const setLastReadIdAfterDrop: Epic<documentActions.DOCUMENT_START_DROP> = (action$, store) =>
	action$.ofType(ActionType.DOCUMENT_START_DROP).mergeMap(action => {
		const state = store.getState()
		if (state.history.lastReadId == action.id) {
			return Observable.of(historyActions.setLastReadId('empty'))
		} else return Observable.empty()
	})

const setLastWriteIdAfterDrop: Epic<documentActions.DOCUMENT_START_DROP> = (action$, store) =>
	action$.ofType(ActionType.DOCUMENT_START_DROP).mergeMap(action => {
		const state = store.getState()
		if (state.history.lastWriteId == action.id) {
			return Observable.of(historyActions.setLastWriteId('empty'))
		} else return Observable.empty()
	})

export default [ redirectAfterCreateDocumentEpic, setLastWriteIdAfterDrop, setLastReadIdAfterDrop ]
