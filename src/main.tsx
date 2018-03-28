import React from 'react'
import ReactDOM from 'react-dom'
import MarkdownWorkspace from 'modules/markdown-workspace'

const App = () => (
    <MarkdownWorkspace />
)

let appContainer = document.getElementById('app')
ReactDOM.render(<App />, appContainer)

