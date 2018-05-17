import React from 'react'
import ReactDOM from 'react-dom'
import Workspace from 'browser/pages/workspace'
import Read from './read'
import Write from './write'
import Timeline from './timeline'
import Splash from 'browser/pages/slpash'
import { systemActionPatterns } from 'common/cross'
import request from 'browser/util/request'
import { hot } from 'react-hot-loader'
import store, { State } from 'browser/store'
import { Provider, connect } from 'react-redux'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import * as appActions from 'browser/actions/app-actions'
import * as documentActions from 'browser/actions/document-actions'
import '../styles/index.scss'

const Frame = ({ isSetupFulfiled }) =>

		isSetupFulfiled ? <Router>
			<Route
				component={() => (
					<div className='AppContent'>
						<Route exact path='/' component={Timeline} />
						<Route exact path='/timeline' component={Timeline} />
						<Route path='/read' component={Read} />
						<Route path='/write' component={Write} />
					</div>
				)}
			/>
		</Router> :
		<Splash />

const ConnectedFrame = connect(
    (state: State) => ({
	    isSetupFulfiled: state.app.isSetupFulfiled
    })
)(Frame)

class App extends React.Component<{}, { started: boolean }> {
	componentDidMount () {
		store.dispatch(appActions.startSetup())
		store.dispatch(documentActions.startFetchAll())
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
