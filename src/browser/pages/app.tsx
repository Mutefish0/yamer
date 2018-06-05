import React from 'react'
import ReactDOM from 'react-dom'
import Read from './read'
import Write from './write'
import Timeline from './timeline'
import Splash from 'browser/pages/slpash'
import Appbar from 'browser/boxs/appbar'
import { systemActionPatterns } from 'common/cross'
import request from 'browser/util/request'
import { hot } from 'react-hot-loader'
import store, { State, history } from 'browser/store'
import { Provider, connect } from 'react-redux'
import { HashRouter as Router, Route, Redirect } from 'react-router-dom'
import createHistory from 'history/createHashHistory'
import { ConnectedRouter } from 'react-router-redux'
import * as appActions from 'browser/actions/app-actions'
import * as documentActions from 'browser/actions/document-actions'

const Frame = ({ isSetupFulfiled }) =>
		isSetupFulfiled ? 
		<ConnectedRouter history={history}>
			<Route
				component={() => (
					<>
					<Appbar /> 
					<div className='AppContent'>
						<Route exact path='/' component={Timeline} />
						<Route path='/read/:id' component={Read} />
						<Route path='/write/:id' component={Write} />
					</div>
					</>
				)}
			/>
		</ConnectedRouter> :
		<Splash />

const ConnectedFrame = connect(
    (state: State) => ({
	    isSetupFulfiled: state.app.isSetupFulfiled
    })
)(Frame)

class App extends React.Component<{}, { started: boolean }> {
	componentDidMount () {
		store.dispatch(appActions.startSetup())
	}

	render () {
		return (
			<Provider store={store}>
				<ConnectedFrame />
			</Provider>
		)
	}
}

export default hot(module)(App)
