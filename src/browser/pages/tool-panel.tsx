import React from 'react'
import classNames from 'classnames'
import WorkContext, { Workmode } from './work-context'
import { Document } from 'common/cross'
import request from 'browser/util/request'

interface Props {
    readOnly: boolean
    workmode: Workmode
    onChangeWorkmode: (mode: Workmode) => any
}

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
        if (!this.props.readOnly) {
            this.props.onChangeWorkmode(mode)
        }
    }

    showPanel () {
        this.setState({ isHidden: false, isHiddenEnd: false })
    }

    hidePanel () {
        this.setState({ isHidden: true })
    }

    render () {
        return (
            <WorkContext.Consumer>
            { ({ source, document }) => (
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
                                className={classNames('button', {
                                    'active': this.props.workmode == 'edit',
                                    'disabled': this.props.readOnly
                                })}
                                onClick={() => this.changeWorkmode('edit')}
                            >编辑</span>
                            <span
                                className={classNames('button', { 'active': this.props.workmode == 'preview' })}
                                onClick={() => this.changeWorkmode('preview')}
                            >预览</span>
                            <span
                                className={classNames('button', {
                                    'active': this.props.workmode == 'live',
                                    'disabled': this.props.readOnly
                                })}
                                onClick={() => this.changeWorkmode('live')}
                            >实时预览</span>
                        </li>
                    </ul>
                </div>
            )}
            </WorkContext.Consumer>
        )
    }
}

export default ToolPanel