import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'base/caret'
import { CharCode } from 'base/char-code'
import * as R from 'ramda' 


interface Props {
    onAstChange: (ast) => any 
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

    render () {
        return (
            <textarea
                className="editor"
                onInput={this.handleInput.bind(this)}
                onKeyDown={this.handleKeyDown.bind(this)}
            >
            </textarea>
        )
    }
}

export default MarkdownEditor