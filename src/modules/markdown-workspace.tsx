import React from 'react'
import MarkdownEditor from './markdown-editor'
import MarkdownMinimap from './markdown-minimap'
import MarkdownShadowEditor from './shadow-editor'
import { Subject, Subscription } from 'rxjs/Rx'

interface State {
    ast: any
}

class MarkdownWorkspace extends React.Component<{}, State> {
    constructor (props) {
        super(props)
        this.state = {
            ast: {
                source: '',
                entities: []
            }
        }
        
        let self = this as any
        self.shadowEditorSource = new Subject()
    }

    handleAstChange (ast) {
        this.setState({ ast })
    }

    handleShadownEditorCursorChange (cursor) {
        (this as any).shadowEditorSource.next(cursor)
    }

    render () {
        return (
            <div className="markdown-workspace">
                <Headbar />
                <div className="workspace">
                    <MarkdownEditor 
                        onAstChange={this.handleAstChange.bind(this)} 
                        cursorSource={(this as any).shadowEditorSource}
                    />
                    <MarkdownMinimap ast={this.state.ast}  />
                    <MarkdownShadowEditor 
                        ast={this.state.ast} 
                        onCursorChange={this.handleShadownEditorCursorChange.bind(this)}
                    />
                </div>
            </div>
        )
    }
}

const Headbar = () => (
    <h1 className="headbar">Markdown Workspace</h1>
)


export default MarkdownWorkspace