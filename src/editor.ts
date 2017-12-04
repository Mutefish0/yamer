import { CharCode } from './base/char-code'
import MarkdownParser from './base/markdown-parser'
import { div, span } from './base/element-creator'
import Component from './base/component'


class Editor extends Component {
    
    construct (fragment: DocumentFragment) {
        let container = div()
        let editArea = div({
            contenteditable: true,
            style: {
                'backgroundColor': 'gray',
                'color': 'white'
            }
        })
        let previewArea = div()

        container.appendChild(editArea)
        container.appendChild(previewArea)
        fragment.appendChild(container)

        return ({
            container,
            editArea,
            previewArea
        })
    }

    wiring (elements) {
        let { editArea, previewArea } = elements

        editArea.addEventListener('keyup', e => {
            previewArea.innerHTML = editArea.innerText
        })
    }
}

export default Editor
