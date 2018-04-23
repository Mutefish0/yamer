import React from 'react'
import ReactDOM from 'react-dom'
import Workspace from 'browser/pages/workspace'
import SetupPage from 'browser/pages/setup-page'

import request from 'browser/util/request'

interface State {
    started: boolean
}

class App extends React.Component<{}, State> {
    constructor (props) {
        super(props)
        this.state = {
            started: false
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

let appContainer = document.getElementById('app')
ReactDOM.render(<App />, appContainer)