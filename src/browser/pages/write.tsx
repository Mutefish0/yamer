import React from 'react'
import { Subscription, Subject } from 'rxjs'
import { RouteComponentProps } from 'react-router'
import { MAST } from 'libs/markdown'
import { connect } from 'react-redux'
import Editor from 'browser/components/editor'
import Reader from 'browser/components/reader'
import store, { State } from 'browser/store' 
import * as documentActions from 'browser/actions/document-actions'
import * as historyActions from 'browser/actions/history-actions'
import * as Mdutil from 'browser/util/mdutil'
import Compiler from 'libs/markdown.js'

import { push } from 'react-router-redux'

interface Params {
    id: string
}

interface Props extends RouteComponentProps<Params> {
    document: State['document']['currentDocument']
    isFetching: boolean,
    writeMode: State['history']['writeMode']
}

class Write extends React.Component<Props> {
    private autoSaveSubscription: Subscription 
    private sourceChangeSubject: Subject<{ source: string, ast: MAST }>

    componentWillMount () {
        const id = this.props.match.params.id
        store.dispatch(documentActions.startFetch(id))
        store.dispatch(historyActions.setLastWriteId(id))

        this.sourceChangeSubject = new Subject()

        this.autoSaveSubscription = this.sourceChangeSubject.debounceTime(1000).subscribe(({ source, ast }) => {
            store.dispatch(documentActions.startSave(this.props.document.id, source, Mdutil.getTitle(source, ast)))
        })
    }

    componentWillUnmount () {
        // 调用unsubscribe时会取消掉pending中的事件，可能丢失最后一次保存
        // this.autoSaveSubscription.unsubscribe()
        // 调用complete则会立即执行最后一个pending中的事件，可以保证最后的更改被保存了
        // See: https://goo.gl/PFfA1H
        this.sourceChangeSubject.complete()
    }

    componentWillReceiveProps (nextProps) {
        const id = nextProps.match.params.id
        if (id != this.props.match.params.id) {
            store.dispatch(documentActions.startFetch(id))
            store.dispatch(historyActions.setLastWriteId(id))
        }
    }

    toggleWriteMode () {
        store.dispatch(historyActions.toggleWriteMode())
    }

    dealChange (change) {
        this.sourceChangeSubject.next(change)
    }

    dealDrop () {
        store.dispatch(documentActions.startDrop(this.props.document.id))
    }

    dealCreate () {
        store.dispatch(documentActions.startCreate())
    }

    render () {
        if (this.props.isFetching) {
            return (
                <div>Loading...</div>
            )
        } else {
            if (this.props.document) {
                const ast = Compiler.parse(this.props.document.content)
                return (
                    <div className={`WritePage ${this.props.writeMode}`}>
                        <section className="wrapper-editor">
                            <Editor defaultValue={this.props.document.content} onChange={this.dealChange.bind(this)}/>
                        </section><section className="wrapper-reader">
                            <Reader ast={ast}/>
                        </section>
                        <ul className="aside-tools">
                            <li><button onClick={this.dealCreate.bind(this)}>新建</button></li>
                            <li><button onClick={this.toggleWriteMode.bind(this)}>
                                { this.props.writeMode == 'live' ? '普通' : '实时' }
                            </button></li>
                            <li><button onClick={this.dealDrop.bind(this)}>删除</button></li>
                        </ul>
                    </div> 
                )
            } else {
                return (
                    <div>
                        暂无文档...
                        <ul className="aside-tools">
                            <li><button onClick={this.dealCreate.bind(this)}>新建</button></li>
                        </ul>
                    </div>
                )
            }
        }
    }
}

export default connect(
    (state: State) => ({
        document: state.document.currentDocument,
        isFetching: state.document.isFetchingDocument,
        writeMode: state.history.writeMode
    })
)(Write)