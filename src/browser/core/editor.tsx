import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'browser/base/caret'
import { CharCode } from 'browser/base/char-code'
import * as R from 'ramda'
import { Subject, Observable, Subscription } from 'rxjs/Rx'
import { WSAVERNOTSUPPORTED } from 'constants';

type IRange = [number, number]

interface Props {

}

interface State {
    cursor: IRange,
    isFocused: boolean
}

class Editor extends React.Component<Props, State> {
    constructor (props) {
        super(props)
        this.state = {
            cursor: [0, 0],
            isFocused: false
        }
    }

    render () {
        return (
            <div className="editor">
                <textarea className="source"></textarea>
                <div className="shadow"></div>
            </div>
        )
    }
}



export default Editor