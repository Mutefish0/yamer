import React from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { State } from 'browser/store'

const Appbar = ({ lastReadId, lastWriteId }) => (
	<header className='Appbar'>
		<NavLink
			to='/'
			exact
			activeStyle={{
				fontWeight: 'bold',
				color: 'indianred'
			}}
		>
			时间轴
		</NavLink>
		<NavLink
			to={`/read/${lastReadId}`}
			activeStyle={{
				fontWeight: 'bold',
				color: 'indianred'
			}}
		>
			阅读
		</NavLink>
		<NavLink 
			to={`/write/${lastWriteId}`}
			activeStyle={{
				fontWeight: 'bold',
				color: 'indianred'
			}}
		>
			写作
		</NavLink>
	</header>
)

export default withRouter<any>(
	connect((state: State) => ({
		lastReadId: state.history.lastReadId,
		lastWriteId: state.history.lastWriteId
	}))(Appbar)
)
