import { div, p, a, span, text } from 'base/element-creator'
import Component from 'base/component'
import RangeMarker from 'browser/base/range-marker'
import Caret from 'browser/base/caret'


/**
 * 由一串字符组成的一个整体
 * 光标只能在其两侧，而不能在内部
 * 其中内容可以被选中
 * 删除操作会删除整体
 */
export default class Sticker extends Component {
    static map: Map<Node, Sticker> = new Map()

    private element: HTMLElement
    private contextSubscription
    private editorContext
    private rangeMarker: RangeMarker

    constructor (element: HTMLElement, editorContext) {
        super()
        this.element = element

        Sticker.map.set(element, this)

        this.editorContext = editorContext
        this.setElement(element) 

        this.initializeEvents()

    }

    private initializeEvents () {
        this.rangeMarker = new RangeMarker(this.element, this.editorContext.container)
        
        this.rangeMarker.caretInSource.subscribe(this.handleCaretIn.bind(this))

        const deleteSource = this.editorContext.observables.deleteAction
        deleteSource.subscribe(this.handleDelete.bind(this))

    }



    private handleInput () {

    }

    private handleCaretIn ({ direction, left, right }) {
        if (direction) {
            Caret.collapse(right)
        } else {
            Caret.collapse(left)
        }
    }

    handleDelete () {
        
    }
}