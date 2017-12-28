import { div, p, a, span, text } from 'base/element-creator'
import Component from 'base/component'
import { CaretActionContextDirection, CaretActionContextCommand, ICaretActionContext } from './editable'
import BoundaryPoint from 'browser/base/boundary-point'
import RangeMarker from 'browser/base/range-marker'


/**
 * 由一串字符组成的一个整体
 * 光标只能在其两侧，而不能在内部
 * 其中内容可以被选中
 * 删除操作会删除整体
 */
export default class Sticker extends Component {
    static map: Map<Node, Sticker> = new Map()

    private range: Range
    private element: HTMLElement
    private leftBoundaryPoint: BoundaryPoint
    private rightBoundaryPoint: BoundaryPoint
    private contextSubscription
    private editorContext

    constructor (element: HTMLElement, editorContext) {
        super()
        this.element = element
        this.range = new Range()
        this.range.selectNodeContents(element)
        this.leftBoundaryPoint = new BoundaryPoint(this.range.startContainer, this.range.startOffset)
        this.rightBoundaryPoint = new BoundaryPoint(this.range.endContainer, this.range.endOffset)
        this.leftBoundaryPoint.decrease(1)
        this.rightBoundaryPoint.increase(1)

        Sticker.map.set(element, this)

        this.editorContext = editorContext
        this.setElement(element) 

        this.initializeEvents()

    }


    private initializeEvents () {
        const globalCaretChange = this.editorContext.observables.caretChange

        const plain = this.editorContext.observables.selectionChange.map(context => context.range) 
        var rm = new RangeMarker(this.range, plain)

        rm.caretInSource.subscribe(this.handleCaretIn.bind(this))
    }



    private handleInput (context: ICaretActionContext) {
    }

    private handleCaretIn (dir) {
        console.log('caret in!')
    }

    handleDelete (context: ICaretActionContext) {

    }
}