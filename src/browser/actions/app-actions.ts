import ActionType from './'

export type APP_ACTION = 
    APP_START_SETUP | APP_FULFIL_SETUP | APP_REJECT_SETUP

export interface APP_START_SETUP {
    type: typeof ActionType.APP_START_SETUP
}

export interface APP_FULFIL_SETUP {
    type: typeof ActionType.APP_FULFIL_SETUP
}

export interface APP_REJECT_SETUP {
    type: typeof ActionType.APP_REJECT_SETUP
    error: any 
}

export const startSetup = (): APP_START_SETUP => ({
	type: ActionType.APP_START_SETUP
})

export const fulfilSetup = (): APP_FULFIL_SETUP => ({
	type: ActionType.APP_FULFIL_SETUP
})

export const rejectSetup = (error): APP_REJECT_SETUP => ({
	type: ActionType.APP_REJECT_SETUP,
	error
})