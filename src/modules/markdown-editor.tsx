import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'base/caret'
import { CharCode } from 'base/char-code'
import * as R from 'ramda' 
import { Subject, Subscription } from 'rxjs/Rx'

interface Props {
    onAstChange: (ast) => any,
    cursorSource: Subject<[number, number]>
}

class MarkdownEditor extends React.Component<Props> {

    handleInput (e) {
        let ast = MarkdownParser.parse(e.target.value)
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