import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'base/caret'
import { CharCode } from 'base/char-code'
import * as R from 'ramda' 
import { Subject, Observable, Subscription } from 'rxjs/Rx'

interface Props {
    onAstChange: (ast) => any,
    onCursorChange: (range) => any,
    cursorSource: Subject<[number, number]>
}

class MarkdownEditor extends React.Component<Props> {

    handleInput (e) {
        const text = e.target.value || ' '
        const ast = MarkdownParser.parse(text) 
        this.props.onAstChange(ast)
    }

    handleKeyDown (e) {
        if (e.keyCode == CharCode.Tab) {
            let cursorOffset = e.target.selectionStart
            let value = e.target.value 
            e.target.value = `${value.slice(0, cursorOffset)}  ${value.slice(cursorOffset)}`
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

        const backspaceSource = Observable.fromEvent(document, 'keyup').filter(e => e['keyCode'] == CharCode.BackSpace)
        const carriageReturnSource = Observable.fromEvent(document, 'keyup').filter(e => e['keyCode'] == CharCode.CarriageReturn)
        const documentCursorChangeSource = Observable.merge(backspaceSource, carriageReturnSource, Observable.fromEvent(document, 'selectionchange'))
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
            >
            </textarea>
        )
    }
}

export default MarkdownEditor