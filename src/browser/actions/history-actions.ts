import ActionType from './'

export type HISTORY_ACTION = HISTORY_SET_LAST_READ_ID | HISTORY_SET_LAST_WRITE_ID
    | HISTORY_TOGGLE_WRITE_MODE

export interface HISTORY_SET_LAST_READ_ID {
    type: typeof ActionType.HISTORY_SET_LAST_READ_ID,
    id: string
}

export interface HISTORY_SET_LAST_WRITE_ID {
    type: typeof ActionType.HISTORY_SET_LAST_WRITE_ID,
    id: string
}

export interface HISTORY_TOGGLE_WRITE_MODE {
    type: typeof ActionType.HISTORY_TOGGLE_WRITE_MODE
}

export const setLastReadId = (id: string): HISTORY_SET_LAST_READ_ID => ({
    type: ActionType.HISTORY_SET_LAST_READ_ID,
    id
}) 

export const setLastWriteId = (id: string): HISTORY_SET_LAST_WRITE_ID => ({
    type: ActionType.HISTORY_SET_LAST_WRITE_ID,
    id
})

export const toggleWriteMode = (): HISTORY_TOGGLE_WRITE_MODE => ({
    type: ActionType.HISTORY_TOGGLE_WRITE_MODE
})