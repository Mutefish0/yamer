import React from 'react'
import Editor, { Reaction } from 'browser/core/editor'
import Reader from 'browser/core/reader'
import classNames from 'classnames'
import { MAST } from 'libs/markdown'
import { Subject } from 'rxjs'

interface State {
    ast: MAST
}

class Workspace extends React.Component<{}, State> {
    private reactionSource: Subject<Reaction> 

    constructor (props) {
        super(props)
        this.state = {
            ast: []
        }
        this.reactionSource = new Subject()
    }

    dealReaderReact (reaction: Reaction) {
        this.reactionSource.next(reaction)
    }

    render () {
        return (
            <div className="workspace">
                <Editor 
                    onAstChange={ast => this.setState({ast})} 
                    reactionSource={this.reactionSource} 
                />
                <Reader ast={this.state.ast} onReact={this.dealReaderReact.bind(this)}/>
            </div>
        )
    }
}

export default Workspace