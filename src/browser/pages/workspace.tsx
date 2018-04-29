import React from 'react'
import Editor, { Reaction } from 'browser/core/editor'
import Reader from 'browser/core/reader'
import ToolPanel from './tool-panel'
import classNames from 'classnames'
import { MAST } from 'libs/markdown'
import { Subject } from 'rxjs'
import WorkContext, { IWorkContext, Workmode } from './work-context'

import request from 'browser/util/request'
import * as Mdutil from 'browser/util/mdutil'

const { ipcRenderer } = require('electron')

interface Props {

}

class Workspace extends React.Component<Props, IWorkContext> {
    private reactionSource: Subject<Reaction>
    
    constructor (props) {
        super(props)
        this.state = {
            ast: [],
            source: '',
            workmode: 'preview',
            document: {
                id: '',
                content: '',
                title: '',
                readOnly: true
            }
        }
        this.reactionSource = new Subject()

        ipcRenderer.on('accelerator', (e, action) => {
            if (action == 'save') {
                request('save', 
                    { id: this.state.document.id }, 
                    {    
                        content: this.state.source, 
                        title: Mdutil.getTitle(this.state.source, this.state.ast) 
                    }
                ) 
            }
        })
    }

    async componentDidMount () {
        const resp = await request('list')
        const doc = Mdutil.assemHomeListDocument(resp.result) 
        this.setState({ document: doc }) 
    }

    dealReaderReact (reaction: Reaction) {
        this.reactionSource.next(reaction)
    }

    dealChangeWorkmode (workmode: Workmode) {
        this.setState({ workmode })
    }

    render () {
        return (
            <WorkContext.Provider value={this.state}>
                <div className={`workspace ${this.state.workmode}`}>
                    <Editor 
                        defaultValue={this.state.document.content}
                        onChange={({source, ast}) => this.setState({ast, source})} 
                        reactionSource={this.reactionSource} 
                    />
                    <Reader ast={this.state.ast} onReact={this.dealReaderReact.bind(this)}/>
                    <ToolPanel
                        readOnly={this.state.document.readOnly} 
                        workmode={this.state.workmode} 
                        onChangeWorkmode={this.dealChangeWorkmode.bind(this)}
                    />
                </div>
            </WorkContext.Provider>
        )
    }
}

export default Workspace