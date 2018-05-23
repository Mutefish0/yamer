import React from 'react'
import { connect } from 'react-redux'
import * as documentActions from 'browser/actions/document-actions'
import store, { State } from 'browser/store'
import { Document as IDocument } from 'common/cross'
import { Link } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'

interface Params {
	id: string
}

interface Props extends RouteComponentProps<Params> {
	list: IDocument[]
	isFetchingDocumentList: boolean
}

class Timeline extends React.Component<Props> {
	componentWillMount () {
		const id = this.props.match.params.id
		store.dispatch(documentActions.startFetchAll())
	}

	render () {
		if (this.props.isFetchingDocumentList) {
			return <div>Loading...</div>
		} else {
			if (this.props.list.length == 0) {
				return <div>暂无文档</div>
			} else {
				return (
					<div className='Timeline'>
						<h2>时间轴</h2>
						<ul>
							{this.props.list.map(document => (
								<li key={document.id}>
									<Link to={`/read/${document.id}`}>{document.title || '未命名'}</Link>
								</li>
							))}
						</ul>
					</div>
				)
			}
		}
	}
}

export default connect((state: State) => ({
	list: state.document.list,
	isFetchingDocumentList: state.document.isFetchingDocumentList
}))(Timeline)
