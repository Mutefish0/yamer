import React from 'react'
import ReactDOM from 'react-dom'
import MarkdownWorkspace from 'modules/markdown-workspace'

const { ipcRenderer } = require('electron')

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
        ipcRenderer.on('bootstrap_success', (event, md) => {
            this.setState({ started: true })
            this.setState({document: md}) 
        })
        ipcRenderer.send('renderer_started')
    }

    render () {
        if (this.state.started) {
            return <MarkdownWorkspace document={this.state.document}/>
        } else {
            return <h1>Yamer正在启动中...</h1>
        }
    }
}

let appContainer = document.getElementById('app')
ReactDOM.render(<App />, appContainer)

