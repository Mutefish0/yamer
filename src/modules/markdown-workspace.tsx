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
    private shadowEditorSource: Subject<any>
    private minimapReactionSource: Subject<any>

    constructor (props) {
        super(props)
        this.state = {
            ast: MarkdownParser.parse('\n'),
            selectionRange: [0, 0],
            editorFocused: false 
        }
        this.shadowEditorSource = new Subject()
        this.minimapReactionSource = new Subject()
    }

    handleAstChange (ast) {
        this.setState({ ast })
    }

    handleShadownEditorCursorChange (cursor) {
        this.shadowEditorSource.next(cursor)
    }

    handleMinimapReaction (action) {
        this.minimapReactionSource.next(action)
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
                        cursorSource={this.shadowEditorSource}
                        reactionSource={this.minimapReactionSource}
                    />
                    <MarkdownMinimap 
                        ast={this.state.ast}
                        onReact={this.handleMinimapReaction.bind(this)}
                    />
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