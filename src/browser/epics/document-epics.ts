import ActionType from 'browser/actions'
import { observableRequest } from 'browser/util/request'
import { Epic } from './'
import { Observable } from 'rxjs'

import {
	DOCUMENT_START_FETCH,
	fulfilFetch,
	rejectFetch,
	DOCUMENT_START_FETCH_ALL,
	fulfilFetchAll,
	rejectFetchAll,
	DOCUMENT_START_SAVE,
	fulfilSave,
	rejectSave,
	DOCUMENT_START_CREATE,
	fulfilCreate,
	rejectCreate,
	DOCUMENT_START_DROP,
	fulfilDrop,
	rejectDrop
} from 'browser/actions/document-actions'

const fetchDocumentEpic: Epic<DOCUMENT_START_FETCH> = (action$, state) =>
	action$
		.ofType(ActionType.DOCUMENT_START_FETCH)
		.mergeMap(action => 
			action.id === 'empty' ? Observable.of(fulfilFetch(null)) :
			observableRequest('document', { id: action.id })
				.map(resp => fulfilFetch(resp.result))
				.catch(error => Observable.of(rejectFetch('error')))
			
		)

const fetchAllDocumentEpic: Epic<DOCUMENT_START_FETCH_ALL> = (action$, state) =>
	action$
		.ofType(ActionType.DOCUMENT_START_FETCH_ALL)
		.mergeMap(action => 
            observableRequest('list')
                .map(resp => fulfilFetchAll(resp.result))
                .catch(error => Observable.of(rejectFetchAll(error)))
		)
		
const dropDocumentEpic: Epic<DOCUMENT_START_DROP> = (action$, state) => 
		action$
			.ofType(ActionType.DOCUMENT_START_DROP)
			.mergeMap(action => 
				observableRequest('drop', { id: action.id })
					.map(resp => fulfilDrop())
					.catch(error => Observable.of(rejectDrop(error)))
			)

const saveDocumentEpic: Epic<DOCUMENT_START_SAVE> = (action$, state) =>
	action$
		.ofType(ActionType.DOCUMENT_START_SAVE)
		.mergeMap(action =>
            observableRequest('save', 
                { id: action.id }, 
                { content: action.content, title: action.title }
            ).map(resp => fulfilSave(resp.result))
		)

const createDocumentEpic: Epic<DOCUMENT_START_CREATE> = (action$, state) =>
    action$
        .ofType(ActionType.DOCUMENT_START_CREATE)
        .mergeMap(action => 
            observableRequest('new')
            .map(resp => fulfilCreate(resp.result))
            .catch(error => Observable.of(rejectCreate(error))) 
        )

export default [fetchDocumentEpic, fetchAllDocumentEpic, dropDocumentEpic, saveDocumentEpic, createDocumentEpic]