import React from 'react'
import Editor, { Reaction } from 'browser/core/editor'
import Reader from 'browser/core/reader'
import ToolPanel,{ Workmode } from './tool-panel'
import classNames from 'classnames'
import { MAST } from 'libs/markdown'
import { Subject } from 'rxjs'
import DocumentContext, { Document } from './document-context'

import request from 'browser/util/request'

interface Props {

}

interface State {
    ast: MAST,
    workmode?: Workmode
    document?: Document
}

class Workspace extends React.Component<Props, State> {
    private reactionSource: Subject<Reaction>
    
    constructor (props) {
        super(props)
        this.state = {
            ast: [],
            workmode: 'live-preview',
            document: {
                id: '',
                content: ''
            }
        }
        this.reactionSource = new Subject()
    }

    async componentDidMount () {
        const resp = await request('document', { id: 'homelist' })
        this.setState({document: resp.result})
    }

    dealReaderReact (reaction: Reaction) {
        this.reactionSource.next(reaction)
    }

    dealChangeWorkmode (workmode: Workmode) {
        this.setState({ workmode })
    }

    render () {
        return (
            <DocumentContext.Provider value={this.state.document}>
                <div className={`workspace ${this.state.workmode}`}>
                    <Editor 
                        defaultValue={this.state.document.content}
                        onAstChange={ast => this.setState({ast})} 
                        reactionSource={this.reactionSource} 
                    />
                    <Reader ast={this.state.ast} onReact={this.dealReaderReact.bind(this)}/>
                    <ToolPanel 
                        workmode={this.state.workmode} 
                        onChangeWorkmode={this.dealChangeWorkmode.bind(this)}
                    />
                </div>
            </DocumentContext.Provider>
        )
    }
}

export default Workspace