import React from 'react'
import WorkContext from './work-context'
import classNames from 'classnames'

interface State {}

interface Props {}

class Appbar extends React.Component<Props, State> {
	render () {
		return (
			<WorkContext.Consumer>
				{({ source, document }) => (
					<section className='appbar'>
						{document && (
							<span
								className={classNames('doc-title', {
									'modify-flag': source != document.content
								})}
							>
								{document.title}
							</span>
						)}
					</section>
				)}
			</WorkContext.Consumer>
		)
	}
}
export default Appbar
