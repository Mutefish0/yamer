import ActionType from './'
import { Document as IDocument } from 'common/cross'

export type DOCUMENT_ACTION = 
	DOCUMENT_START_FETCH | DOCUMENT_FULFIL_FETCH | DOCUMENT_REJECT_FETCH 
	| DOCUMENT_START_FETCH_ALL | DOCUMENT_FULFIL_FETCH_ALL | DOCUMENT_REJECT_FETCH_ALL
	| DOCUMENT_START_SAVE | DOCUMENT_FULFIL_SAVE | DOCUMENT_REJECT_SAVE
	| DOCUMENT_START_DROP | DOCUMENT_FULFIL_DROP | DOCUMENT_REJECT_DROP
	| DOCUMENT_START_RETRIE | DOCUMENT_FULFIL_RETRIE | DOCUMENT_REJECT_RETRIE
	| DOCUMENT_START_CREATE | DOCUMENT_FULFIL_CREATE | DOCUMENT_REJECT_CREATE
	| DOCUMENT_START_EMPTY_TRASH | DOCUMENT_FULFIL_EMPTY_TRASH | DOCUMENT_REJECT_EMPTY_TRASH

export interface DOCUMENT_START_FETCH {
	type: typeof ActionType.DOCUMENT_START_FETCH,
	id: string
}

export interface DOCUMENT_FULFIL_FETCH {
	type: typeof ActionType.DOCUMENT_FULFIL_FETCH,
	document: IDocument
}

export interface DOCUMENT_REJECT_FETCH {
	type: typeof ActionType.DOCUMENT_REJECT_FETCH,
	error: any
}

export interface DOCUMENT_START_FETCH_ALL {
	type: typeof ActionType.DOCUMENT_START_FETCH_ALL
}

export interface DOCUMENT_FULFIL_FETCH_ALL {
	type: typeof ActionType.DOCUMENT_FULFIL_FETCH_ALL,
	documents: IDocument[]
}

export interface DOCUMENT_REJECT_FETCH_ALL {
	type: typeof ActionType.DOCUMENT_REJECT_FETCH_ALL,
	error: any
}

export interface DOCUMENT_START_SAVE {
	type: typeof ActionType.DOCUMENT_START_SAVE,
	id: string,
	content: string,
	title: string
}

export interface DOCUMENT_FULFIL_SAVE {
	type: typeof ActionType.DOCUMENT_FULFIL_SAVE,
	document: IDocument
}

export interface DOCUMENT_REJECT_SAVE {
	type: typeof ActionType.DOCUMENT_REJECT_SAVE,
	error: any
}

export interface DOCUMENT_START_DROP {
	type: typeof ActionType.DOCUMENT_START_DROP,
	id: string
}

export interface DOCUMENT_FULFIL_DROP {
	type: typeof ActionType.DOCUMENT_FULFIL_DROP,
}

export interface DOCUMENT_REJECT_DROP {
	type: typeof ActionType.DOCUMENT_REJECT_DROP,
	error: any
}

export interface DOCUMENT_START_RETRIE {
	type: typeof ActionType.DOCUMENT_START_RETRIE,
	id: string
}

export interface DOCUMENT_FULFIL_RETRIE {
	type: typeof ActionType.DOCUMENT_FULFIL_RETRIE,
	document: IDocument
}

export interface DOCUMENT_REJECT_RETRIE {
	type: typeof ActionType.DOCUMENT_REJECT_RETRIE,
	error: any
}

export interface DOCUMENT_START_CREATE {
	type: typeof ActionType.DOCUMENT_START_CREATE
}

export interface DOCUMENT_FULFIL_CREATE {
	type: typeof ActionType.DOCUMENT_FULFIL_CREATE,
	document: IDocument
}

export interface DOCUMENT_REJECT_CREATE {
	type: typeof ActionType.DOCUMENT_REJECT_CREATE,
	error: any
}

export interface DOCUMENT_START_EMPTY_TRASH {
	type: typeof ActionType.DOCUMENT_START_EMPTY_TRASH
}

export interface DOCUMENT_FULFIL_EMPTY_TRASH {
	type: typeof ActionType.DOCUMENT_FULFIL_EMPTY_TRASH
}

export interface DOCUMENT_REJECT_EMPTY_TRASH {
	type: typeof ActionType.DOCUMENT_REJECT_EMPTY_TRASH,
	error: any
}

export const startFetch = (id: string): DOCUMENT_START_FETCH => ({
	type: ActionType.DOCUMENT_START_FETCH,
	id
})

export const fulfilFetch = (document: IDocument): DOCUMENT_FULFIL_FETCH => ({
	type: ActionType.DOCUMENT_FULFIL_FETCH,
	document
})

export const rejectFetch = (error: string): DOCUMENT_REJECT_FETCH => ({
	type: ActionType.DOCUMENT_REJECT_FETCH,
	error
})

export const startFetchAll = (): DOCUMENT_START_FETCH_ALL => ({
	type: ActionType.DOCUMENT_START_FETCH_ALL
})

export const fulfilFetchAll = (documents: IDocument[]): DOCUMENT_FULFIL_FETCH_ALL => ({
	type: ActionType.DOCUMENT_FULFIL_FETCH_ALL,
	documents
})

export const rejectFetchAll = (error: string): DOCUMENT_REJECT_FETCH_ALL => ({
	type: ActionType.DOCUMENT_REJECT_FETCH_ALL,
	error
})

export const startSave = (id: string, content: string, title: string): DOCUMENT_START_SAVE => ({
	type: ActionType.DOCUMENT_START_SAVE,
	id, content, title
})

export const fulfilSave = (document: IDocument): DOCUMENT_FULFIL_SAVE => ({
	type: ActionType.DOCUMENT_FULFIL_SAVE,
	document
})

export const rejectSave = (error: string): DOCUMENT_REJECT_SAVE => ({
	type: ActionType.DOCUMENT_REJECT_SAVE,
	error
})

export const startDrop = (id: string): DOCUMENT_START_DROP => ({
	type: ActionType.DOCUMENT_START_DROP,
	id
})

export const fulfilDrop = (): DOCUMENT_FULFIL_DROP => ({
	type: ActionType.DOCUMENT_FULFIL_DROP
})

export const rejectDrop = (error: string): DOCUMENT_REJECT_DROP => ({
	type: ActionType.DOCUMENT_REJECT_DROP,
	error
})

export const startRetrie = (id: string): DOCUMENT_START_RETRIE => ({
	type: ActionType.DOCUMENT_START_RETRIE,
	id
})

export const fulfilRetrie = (document: IDocument): DOCUMENT_FULFIL_RETRIE => ({
	type: ActionType.DOCUMENT_FULFIL_RETRIE,
	document
})

export const rejectRetrie = (error: string): DOCUMENT_REJECT_RETRIE => ({
	type: ActionType.DOCUMENT_REJECT_RETRIE,
	error
})

export const startCreate = (): DOCUMENT_START_CREATE => ({
	type: ActionType.DOCUMENT_START_CREATE
})

export const fulfilCreate = (document: IDocument): DOCUMENT_FULFIL_CREATE => ({
	type: ActionType.DOCUMENT_FULFIL_CREATE,
	document
})

export const rejectCreate = (error: string): DOCUMENT_REJECT_CREATE => ({
	type: ActionType.DOCUMENT_REJECT_CREATE,
	error
})

export const startEmptyTrash = (): DOCUMENT_START_EMPTY_TRASH => ({
	type: ActionType.DOCUMENT_START_EMPTY_TRASH
})

export const fulfilEmptyTrash = (): DOCUMENT_FULFIL_EMPTY_TRASH => ({
	type: ActionType.DOCUMENT_FULFIL_EMPTY_TRASH
})

export const rejectEmptyTrash = (error: string): DOCUMENT_REJECT_EMPTY_TRASH => ({
	type: ActionType.DOCUMENT_REJECT_EMPTY_TRASH,
	error
})
