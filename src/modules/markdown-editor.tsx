import React from 'react'
import MarkdownParser from 'libs/markdown.js'

interface Props {
    onAstChange: (ast) => any 
}

class MarkdownEditor extends React.Component<Props> {

    inputHandler (e) {
        this.props.onAstChange(MarkdownParser.parse(e.target.innerText))
    }

    render () {
        return (
            <div
                className="editor"
                contentEditable={true}
                onInput={this.inputHandler.bind(this)}
            >
            </div>
        )
    }
}

export default MarkdownEditor