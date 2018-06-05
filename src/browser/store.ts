import { createEpicMiddleware } from 'redux-observable'
import rootEpic from './epics'
import reducer, { State } from './reducers'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createHashHistory'
import { routerMiddleware } from 'react-router-redux'

const history = createHistory()

const epicMiddleware = createEpicMiddleware(rootEpic)

const store = createStore(
	reducer,
	compose(
		applyMiddleware(epicMiddleware),
		applyMiddleware(routerMiddleware(history)),
		window['__REDUX_DEVTOOLS_EXTENSION__'] ? window['__REDUX_DEVTOOLS_EXTENSION__']() : f => f
	)
)


export { State, history }

export default store
