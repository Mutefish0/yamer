import React from 'react'
import { connect } from 'react-redux'
import * as documentActions from 'browser/actions/document-actions'
import * as historyActions from 'browser/actions/history-actions'
import store, { State } from 'browser/store'
import { RouteComponentProps } from 'react-router'
import { Document as IDocument } from 'common/cross'
import Reader from 'browser/components/reader'
import Compiler from 'libs/markdown.js'
import { Link } from 'react-router-dom'

interface Params {
    id: string
}

interface Props extends RouteComponentProps<Params> {
    document: IDocument
    isFetching: boolean
}


class Read extends React.Component<Props> {
    componentWillMount () {
        const id = this.props.match.params.id
        store.dispatch(documentActions.startFetch(id))
        store.dispatch(historyActions.setLastReadId(id))
    }

    render () {
        if (this.props.isFetching) {
            return (<div> Loading... </div>)
        } else if (this.props.document) {
            const ast = Compiler.parse(this.props.document.content)
            return (
                <>
                <Reader  ast={ast}/>
                <ul className="aside-tools">
                    <li><Link to={`/write/${this.props.document.id}`}>编辑</Link></li>
                </ul>
                </>
            )   
        } else {
            return (
                <div>暂无文档...</div>
            )
        }
    }
}

export default connect(
    (state: State) => ({
        document: state.document.currentDocument,
        isFetching: state.document.isFetchingDocument
    })
)(Read)
