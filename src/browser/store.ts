import { createEpicMiddleware } from 'redux-observable'
import rootEpic from './epics'
import reducer, { State } from './reducers'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'

import { ConnectableObservable } from 'rx'

const epicMiddleware = createEpicMiddleware(rootEpic)

const store = createStore(
	reducer,
	compose(
		applyMiddleware(epicMiddleware),
		window['__REDUX_DEVTOOLS_EXTENSION__'] && window['__REDUX_DEVTOOLS_EXTENSION__']()
	)
)


export { State }

export default store
