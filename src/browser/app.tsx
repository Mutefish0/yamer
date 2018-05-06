import React from 'react'
import ReactDOM from 'react-dom'
import Workspace from 'browser/pages/workspace'
import SetupPage from 'browser/pages/setup-page'
import { systemActionPatterns } from 'common/cross'
import request from 'browser/util/request'
import { hot } from 'react-hot-loader'

class App extends React.Component<{}, { started: boolean }> {
    constructor (props) {
        super(props)
        this.state = {
            started: true
        }
    }

    async componentDidMount () {
        await request('setup')
        this.setState({ started: true })
    }

    render () {
        if (this.state.started) {
            return <Workspace />
        } else {
            return <SetupPage />
        }
    }
}


export default hot(module)(App)