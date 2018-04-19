import React from 'react'
import ReactDOM from 'react-dom'
import Workspace from 'browser/pages/workspace'

interface State {
    started: boolean

    document: string
}

class App extends React.Component<{}, State> {
    constructor (props) {
        super(props)
        this.state = {
            started: false,

            document: ''
        }
    }

    render () {
        return <Workspace />
    }
}

let appContainer = document.getElementById('app')
ReactDOM.render(<App />, appContainer)