import React from 'react'
import Editor, { Reaction } from 'browser/modules/editor'
import Reader from 'browser/modules/reader'
import Loading from './loading'
import Appbar from './appbar'
import classNames from 'classnames'
import { MAST } from 'libs/markdown'
import { Subject } from 'rxjs'
import WorkContext, { IWorkContext, Workmode } from './work-context'
import { pullActionPatterns } from 'common/cross'
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
            document: null
        }
        
        this.reactionSource = new Subject()

        ipcRenderer.on('accelerator', async (e, action) => {
            if (!this.state.document) {
                return
            }

            if (action == 'save') {
                const resp = await request('save', 
                    { id: this.state.document.id }, 
                    {    
                        content: this.state.source, 
                        title: Mdutil.getTitle(this.state.source, this.state.ast) 
                    }
                )
                this.setState({ document: resp.result }) 
            } else if (action == 'new') {
                const resp = await request('new')
                this.setState({ document: resp.result })
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

    async dealSchemaRequest (path) {
        const match = pullActionPatterns.document.match(`/api${path}`)
        if (match) {
            const resp = await request('document', { id: match.id })
            this.setState({ document: resp.result })
        }
    }

    render () {
        let pageView = this.state.document ? (
            <div className={`workspace ${this.state.workmode}`}>
                <Editor
                    defaultValue={this.state.document.content}
                    onChange={({ source, ast }) => this.setState({ ast, source })}
                    reactionSource={this.reactionSource}
                />
                <Reader
                    ast={this.state.ast}
                    onReact={this.dealReaderReact.bind(this)}
                    onSchemaRequest={this.dealSchemaRequest.bind(this)}
                />
            </div>
        ) : <Loading />

        return (
            <WorkContext.Provider value={this.state}>
                <Appbar />
                { pageView }
            </WorkContext.Provider>
        )
    }
}

export default Workspace