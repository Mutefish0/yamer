import React from 'react'
import classNames from 'classnames'
import MarkdownEditor from './markdown-editor'
import MarkdownMinimap from './markdown-minimap'
import MarkdownShadowEditor from './shadow-editor'
import { Subject, Subscription } from 'rxjs/Rx'
import MarkdownParser from 'libs/markdown.js'
import ToolPanel, { WorkMode } from './tool-panel'


interface State {
    ast: any,
    selectionRange: [number, number],
    editorFocused: boolean

    workMode: WorkMode   
}

interface Props {
    document: string
}

class MarkdownWorkspace extends React.Component<Props, State> {
    private shadowEditorSource: Subject<any>
    private minimapReactionSource: Subject<any>

    constructor (props) {
        super(props)
        this.state = {
            ast: MarkdownParser.parse('\n'),
            selectionRange: [0, 0],
            editorFocused: false,

            workMode: 'live-preview'
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
                <div className={
                    classNames("workspace", {
                        'edit': this.state.workMode == 'edit',
                        'preview': this.state.workMode == 'preview',
                        'live-preview': this.state.workMode == 'live-preview'
                    })}
                >
                    <MarkdownEditor 
                        onAstChange={this.handleAstChange.bind(this)} 
                        onCursorChange={selectionRange => this.setState({ selectionRange })}
                        onFocusChange={(focused) => this.setState({ editorFocused: focused })}
                        cursorSource={this.shadowEditorSource}
                        reactionSource={this.minimapReactionSource}
                        value={this.props.document}
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
                    <ToolPanel workMode={this.state.workMode} onChangeWorkMode={workMode => this.setState({workMode})} />
                </div>
            </div>
        )
    }
}


export default MarkdownWorkspace