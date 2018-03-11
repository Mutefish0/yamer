import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'base/caret'
import * as R from 'ramda' 

interface Props {
    onAstChange: (ast) => any 
}

class MarkdownEditor extends React.Component<Props> {

    handleInput (e) {
        let ast = MarkdownParser.parse(e.target.innerText)
        this.props.onAstChange(ast)
    }

    handlePaste (e) {
        // only paste plain text 
        if (e.clipboardData.types.indexOf('text/html') > -1) {
            let text = e.clipboardData.getData('text/plain')
            let df = document.createDocumentFragment()

            let children = R.compose(
                R.forEach(node => df.appendChild(node as Node)),
                R.map(c => typeof (c) == 'function' ? c() : c),
                R.intersperse(() => document.createElement('br')),
                R.map(R.bind(document.createTextNode, document)),
                R.split('\n')
            )(text)

            let range = Caret.getRange()
            range.insertNode(df)

            this.handleInput(e)

            e.preventDefault()
        }
    }

    render () {
        return (
            <div
                className="editor"
                contentEditable={true}
                onInput={this.handleInput.bind(this)}
                onPaste={this.handlePaste.bind(this)}
            >
            </div>
        )
    }
}

export default MarkdownEditor

