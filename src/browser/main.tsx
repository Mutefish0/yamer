import React from 'react'
import ReactDOM from 'react-dom'
import MarkdownWorkspace from 'browser/modules/markdown-workspace'

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

    componentDidMount () {
       
    }

    render () {
        return <MarkdownWorkspace document={this.state.document}/>
    }
}

let appContainer = document.getElementById('app')
ReactDOM.render(<App />, appContainer)