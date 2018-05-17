import React from 'react'
import { connect } from 'react-redux'
import * as documentActions from 'browser/actions/document-actions'
import store, { State } from 'browser/store'
import { Document as IDocument } from 'common/cross'

interface Props {
    list: IDocument[]
}

const Timeline = ({ list }: Props) => (
    <div>
        <h2>时间轴</h2>
        <ul>
            {list.map(document => (
                <li key={document.id}>{document.title}</li>
            ))}
        </ul>
    </div>
)

export default connect(
    (state: State): Props => ({
        list: state.document.list
    })
)(Timeline)