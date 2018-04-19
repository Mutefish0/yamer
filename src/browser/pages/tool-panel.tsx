import React from 'react'
import classNames from 'classnames'

interface Props {
    workMode: WorkMode
    onChangeWorkMode: (mode: WorkMode) => any
}

export type WorkMode = 'edit' | 'preview' | 'live-preview'

interface State {
    isHidden: boolean
    isHiddenEnd: boolean
}

class ToolPanel extends React.Component<Props, State> {
    constructor (props) {
        super(props)
        this.state = {
            isHidden: true,
            isHiddenEnd: true
        }
    }

    
    changeWorkMode (mode) {
        this.props.onChangeWorkMode(mode)
    }

    showPanel () {
        this.setState({ isHidden: false, isHiddenEnd: false })
    }

    hidePanel () {
        this.setState({ isHidden: true })
    }

    render () {
        return (
            <div
                className={classNames("tool-panel", { 'collapsed': this.state.isHidden})}
                onBlur={this.hidePanel.bind(this)}
                tabIndex={1}
                onTransitionEnd={() => this.setState({isHiddenEnd: this.state.isHidden})}
            >
                <span 
                    className={classNames("toggle", { 'hidden': !this.state.isHiddenEnd})}
                    onClick={this.showPanel.bind(this)}
                > 
                </span>
                <ul>
                    <li className="setting live-preview">
                        <h2>工作模式</h2>
                        <span 
                            
                            className={classNames('button', {'active': this.props.workMode == 'edit'})}
                            onClick={() => this.changeWorkMode('edit')}
                        >编辑</span>
                        <span
                            className={classNames('button', { 'active': this.props.workMode == 'preview' })}
                            onClick={() => this.changeWorkMode('preview')}
                        >预览</span>
                        <span
                            className={classNames('button', { 'active': this.props.workMode == 'live-preview' })}
                            onClick={() => this.changeWorkMode('live-preview')}
                        >实时预览</span>
                    </li>
                </ul>
            </div>
        )
    }
}

export default ToolPanel