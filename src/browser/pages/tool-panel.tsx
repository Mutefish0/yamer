import React from 'react'
import classNames from 'classnames'

interface Props {
    workmode: Workmode
    onChangeWorkmode: (mode: Workmode) => any
}

export type Workmode = 'edit' | 'preview' | 'live-preview'

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

    
    changeWorkmode (mode) {
        this.props.onChangeWorkmode(mode)
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
                            
                            className={classNames('button', {'active': this.props.workmode == 'edit'})}
                            onClick={() => this.changeWorkmode('edit')}
                        >编辑</span>
                        <span
                            className={classNames('button', { 'active': this.props.workmode == 'preview' })}
                            onClick={() => this.changeWorkmode('preview')}
                        >预览</span>
                        <span
                            className={classNames('button', { 'active': this.props.workmode == 'live-preview' })}
                            onClick={() => this.changeWorkmode('live-preview')}
                        >实时预览</span>
                    </li>
                    <li>
                        <h2>操作</h2>
                        <a>保存文档</a>
                    </li>
                </ul>
            </div>
        )
    }
}

export default ToolPanel