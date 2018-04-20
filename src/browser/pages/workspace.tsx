import React from 'react'
import Editor, { Reaction } from 'browser/core/editor'
import Reader from 'browser/core/reader'
import ToolPanel,{ Workmode } from './tool-panel'
import classNames from 'classnames'
import { MAST } from 'libs/markdown'
import { Subject } from 'rxjs'

interface State {
    ast: MAST,
    workmode: Workmode
}

class Workspace extends React.Component<{}, State> {
    private reactionSource: Subject<Reaction> 

    constructor (props) {
        super(props)
        this.state = {
            ast: [],
            workmode: 'live-preview'
        }
        this.reactionSource = new Subject()
    }

    dealReaderReact (reaction: Reaction) {
        this.reactionSource.next(reaction)
    }

    dealChangeWorkmode (workmode: Workmode) {
        this.setState({ workmode })
    }

    render () {
        return (
            <div className={`workspace ${this.state.workmode}`}>
                <Editor 
                    onAstChange={ast => this.setState({ast})} 
                    reactionSource={this.reactionSource} 
                />
                <Reader ast={this.state.ast} onReact={this.dealReaderReact.bind(this)}/>
                <ToolPanel 
                    workmode={this.state.workmode} 
                    onChangeWorkmode={this.dealChangeWorkmode.bind(this)}
                />
            </div>
        )
    }
}

export default Workspace