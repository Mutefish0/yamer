import { CharCode } from 'base/char-code'
import MarkdownParser from 'base/markdown-parser'
import { div, span } from 'base/element-creator'
import Component from 'base/component'
import CoreEditor from 'browser/modules/core-editor'

class Editor extends Component {
    
    construct (fragment: DocumentFragment) {
        let container = div()
        let editArea = div()
        let previewArea = div()
        
        let coreEditor = new CoreEditor()

        coreEditor.mount(editArea) 

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
    }
} 

export default Editor
