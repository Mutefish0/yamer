import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'base/caret'
import * as R from 'ramda' 

interface Props {
    onAstChange: (ast) => any 
}

class MarkdownEditor extends React.Component<Props> {

    handleInput (e) {
        let ast = MarkdownParser.parse(e.target.value)
        this.props.onAstChange(ast)
    }

    render () {
        return (
            <textarea
                className="editor"
                onInput={this.handleInput.bind(this)}
            >
            </textarea>
        )
    }
}

export default MarkdownEditor