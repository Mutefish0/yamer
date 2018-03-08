import React from 'react'
import MarkdownEditor from './markdown-editor'
import MarkdownMinimap from './markdown-minimap'

interface State {
    ast: any
}

class MarkdownWorkspace extends React.Component<{}, State> {
    constructor (props) {
        super(props)
        this.state = {
            ast: []
        }
    }

    handleAstChange (ast) {
        this.setState({ ast: ast })
    }

    render () {
        return (
            <div className="markdown-workspace">
                <Headbar />
                <div className="workspace">
                    <MarkdownEditor onAstChange={this.handleAstChange.bind(this)} />
                    <MarkdownMinimap ast={this.state.ast} />
                </div>
            </div>
        )
    }
}

const Headbar = () => (
    <h1 className="headbar">Markdown Workspace</h1>
)


export default MarkdownWorkspace