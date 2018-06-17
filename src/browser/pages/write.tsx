import React from 'react'
import { Subscription, Subject, Observable } from 'rxjs'
import { RouteComponentProps } from 'react-router'
import { MAST } from 'libs/markdown'
import { connect } from 'react-redux'
import Editor, { ScrollPosition } from 'browser/components/editor'
import Reader from 'browser/components/reader'
import store, { State } from 'browser/store' 
import * as documentActions from 'browser/actions/document-actions'
import * as historyActions from 'browser/actions/history-actions'
import * as Mdutil from 'browser/util/mdutil'

interface Params {
    id: string
}

interface Props extends RouteComponentProps<Params> {
    document: State['document']['currentDocument']
    isFetching: boolean,
    writeMode: State['history']['writeMode']
}

interface IState {
    ast: MAST
}

class Write extends React.Component<Props, IState> {
    private sourceChangeSubject: Subject<{ source: string, ast: MAST }>

    private readerScrollSubject: Subject<ScrollPosition> 
    private editorScrollSubject: Subject<ScrollPosition> 

    private readerScrollLock: boolean
    private editorScrollLock: boolean
        

    constructor (props) {
        super(props)
        this.state = {
            ast: []
        }
    }

    componentWillMount () {
        const id = this.props.match.params.id
        store.dispatch(documentActions.startFetch(id))
        store.dispatch(historyActions.setLastWriteId(id))

        this.sourceChangeSubject = new Subject()

        // 自动保存
        this.sourceChangeSubject.debounceTime(1000).subscribe(({ source, ast }) => {
            this.props.document && store.dispatch(documentActions.startSave(this.props.document.id, source, Mdutil.getTitle(source, ast)))
        })

        // 更新提供给阅读器的语法树
        this.sourceChangeSubject.subscribe(({ ast }) => {
            this.setState({ ast })
        })

        // 滚动同步
        this.readerScrollSubject = new Subject()
        this.editorScrollSubject = new Subject()

        this.readerScrollSubject.subscribe(() => {
            this.readerScrollLock = true
        })
        this.readerScrollSubject.debounceTime(1000).subscribe(() => {
            this.readerScrollLock = false
        })

        this.editorScrollSubject.subscribe(() => {
            this.editorScrollLock = true 
        })
        this.editorScrollSubject.debounceTime(1000).subscribe(() => {
            this.editorScrollLock = false
        })

    }

    componentWillUnmount () {
        // 调用unsubscribe时会取消掉pending中的事件，可能丢失最后一次保存
        // this.autoSaveSubscription.unsubscribe()
        // 调用complete则会立即执行最后一个pending中的事件，可以保证最后的更改被保存了
        // See: https://goo.gl/PFfA1H
        this.sourceChangeSubject.complete()

        this.readerScrollSubject.complete()
        this.editorScrollSubject.complete()
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
                return (
                    <div className={`WritePage ${this.props.writeMode}`}>
                        <section className="wrapper-editor">
                            <Editor defaultValue={this.props.document.content} 
                                onChange={this.dealChange.bind(this)}
                                scrollSource={this.editorScrollSubject}
                                onScroll={scrollPosition => !this.editorScrollLock && this.readerScrollSubject.next(scrollPosition)}
                                />
                        </section><section className="wrapper-reader">
                            <Reader  
                                overflowAuto={true} ast={this.state.ast} 
                                scrollSource={this.readerScrollSubject}
                                onScroll={scrollPosition => !this.readerScrollLock && this.editorScrollSubject.next(scrollPosition)}
                            /> 
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