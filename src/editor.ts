import { CharCode } from 'base/char-code'
import { div, span } from 'base/element-creator'
import Component from 'base/component'
import Editable from 'browser/modules/editable'

class Editor extends Component {
    constructor () {
        super()
        let container = div({
            class: 'markdown editor'
        })
        let editArea = div()
        let previewArea = div()
        
        let editable = new Editable()
        editable.mount(editArea)

        container.appendChild(editArea)
        container.appendChild(previewArea)

        this.setElement(container)
    }
} 

export default Editor
