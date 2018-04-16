import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'browser/base/caret'
import { CharCode } from 'browser/base/char-code'
import * as R from 'ramda' 
import { Subject, Observable, Subscription } from 'rxjs/Rx'

interface Props {
    onAstChange: (ast) => any,
    onCursorChange: (range) => any,
    onFocusChange: (focused: boolean) => any
    cursorSource: Subject<[number, number]>
    reactionSource: Subject<any>

    value: string
}

class MarkdownEditor extends React.Component<Props> {

    handleInput () {
        let target = this.refs['editor'] as any 
        const text = target.value || ' '
        const ast = MarkdownParser.parse(text) 
        this.props.onAstChange(ast)
    }

    handleKeyDown (e) {
        if (e.keyCode == CharCode.Tab) {
            let cursorOffset = e.target.selectionStart
            let value = e.target.value 
            e.target.value = `${value.slice(0, cursorOffset)}  ${value.slice(cursorOffset)}`
            this.handleInput() 
            e.target.setSelectionRange(cursorOffset + 2, cursorOffset + 2);
            e.preventDefault()
        }
    }

    componentDidMount () {
        this.props.cursorSource.subscribe(cursor => {
            let target = this.refs['editor'] as any
            target.setSelectionRange(cursor[0], cursor[1])
            target.focus() 
        })

        let prevRange = [0, 0]

        const inputSource = Observable.fromEvent(this.refs['editor'] as Element, 'input')
        const carriageReturnSource = Observable.fromEvent(document, 'keyup').filter(e => e['keyCode'] == CharCode.CarriageReturn)
        const documentCursorChangeSource = Observable.merge(inputSource, carriageReturnSource, Observable.fromEvent(document, 'selectionchange'))
        const cursorChangeSource = documentCursorChangeSource.map(e => {
            const refEditor = this.refs['editor'] as any
            return [refEditor.selectionStart, refEditor.selectionEnd]
        })
        const diffSource = cursorChangeSource.filter(range => {
            if (range[0] != prevRange[0] || range[1] != prevRange[1]) {
                prevRange = range
                return true
            } else {
                return false
            }
        })

        diffSource.subscribe(range => this.props.onCursorChange(range))

        this.props.reactionSource.subscribe(action => {
            switch (action.type) {
                case 'click_checkbox':
                    const target = this.refs['editor'] as any 
                    const value = target.value
                    const node = action.node
                    const isChecked = node.checked
                    const range = node.ranges['check']
                    target.value = `${value.slice(0, range[0])}${isChecked ? ' ' : 'x'}${value.slice(range[1])}`
                    this.handleInput()
                default:                
            }
        })
    }

    componentWillUnmount () {
        this.props.cursorSource.unsubscribe()
    }

    render () {
        return (
            <textarea
                className="editor"
                ref="editor"
                onInput={this.handleInput.bind(this)}
                onKeyDown={this.handleKeyDown.bind(this)}
                onFocus={() => this.props.onFocusChange(true)}
                onBlur={() => this.props.onFocusChange(false)}
                
            >
            </textarea>
        )
    }
}

export default MarkdownEditor