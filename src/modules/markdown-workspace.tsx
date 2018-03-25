import React from 'react'
import MarkdownEditor from './markdown-editor'
import MarkdownMinimap from './markdown-minimap'
import MarkdownShadowEditor from './shadow-editor'
import { Subject, Subscription } from 'rxjs/Rx'
import MarkdownParser from 'libs/markdown.js'

interface State {
    ast: any,
    selectionRange: [number, number],
    editorFocused: boolean
}

class MarkdownWorkspace extends React.Component<{}, State> {
    constructor (props) {
        super(props)
        this.state = {
            ast: MarkdownParser.parse('\n'),
            selectionRange: [0, 0],
            editorFocused: false 
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
                        onCursorChange={selectionRange => this.setState({ selectionRange })}
                        onFocusChange={(focused) => this.setState({ editorFocused: focused })}
                        cursorSource={(this as any).shadowEditorSource}
                    />
                    <MarkdownMinimap ast={this.state.ast}  />
                    <MarkdownShadowEditor 
                        focused={this.state.editorFocused}
                        selectionRange={this.state.selectionRange}
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