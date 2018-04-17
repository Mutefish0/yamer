import React from 'react'
import ReactDOM from 'react-dom'
import MarkdownWorkspace from 'browser/modules/markdown-workspace'

import Editor from 'browser/core/editor'

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
        return (
            <div className="workspace">
                <Editor />
            </div>
        )
        //return <MarkdownWorkspace document={this.state.document}/>
    }
}

let appContainer = document.getElementById('app')
ReactDOM.render(<App />, appContainer)