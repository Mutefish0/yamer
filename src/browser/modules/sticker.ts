import { div, p, a, span, text } from 'base/element-creator'
import Component from 'base/component'
import { CaretActionContextDirection, CaretActionContextCommand, ICaretActionContext } from './editable'
import ContentRange from 'browser/base/content-range'
import BoundaryPoint from 'browser/base/boundary-point'


import RangeMarker from 'browser/base/range-marker'


/*
events: [
    'selectIn'
    'selectOut'
]
*/ 




/**
 * 由一串字符组成的一个整体
 * 光标只能在其两侧，而不能在内部
 * 其中内容可以被选中
 * 删除操作会删除整体
 */
export default class Sticker extends Component {
    static map: Map<Node, Sticker> = new Map()

    private range: ContentRange
    private element: HTMLElement
    private leftBoundaryPoint: BoundaryPoint
    private rightBoundaryPoint: BoundaryPoint
    private contextSubscription
    private editorContext

    constructor (element: HTMLElement, editorContext) {
        super()
        this.element = element
        this.range = new ContentRange()
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

    }



    private handleInput (context: ICaretActionContext) {
        if (context.command == CaretActionContextCommand.CaretChange) {
            console.log(context.range.startOffset)
            console.log(context.range.endOffset)

            const range = context.range
            const bpStart = BoundaryPoint.fromRangeStart(range)

            if (this.range.positionWith(bpStart) == ContentRange.RIGHT_ADJACENT) {
                const c = this.range.toString()
                if (c.length > 2) {
                    console.log('input right!')
                    const extra = c.slice(2)
                    this.element.textContent = '加粗'
                    var t = text(extra)
                    
                    
                    var newRange = new Range()
                    newRange.selectNode(this.element)
                    newRange.collapse(false)
                    newRange.insertNode(t)
                    newRange.selectNode(t)
                    newRange.collapse(false)
                    this.editorContext.editor.setSelection(newRange)

                }
            }
        }
    }

    private handleCaretIn (context: ICaretActionContext) {
        if (context.command == CaretActionContextCommand.CaretChange) {
        
            const range = context.range
            const bpStart =  BoundaryPoint.fromRangeStart(range)
            const bpEnd = BoundaryPoint.fromRangeEnd(range)

            // let setTo
            // if (context.direction == CaretActionContextDirection.LTR) {
            //     setTo = this.rightBoundaryPoint
            // } else {
            //     setTo = this.leftBoundaryPoint
            // }

            // const newRange = range.cloneRange()
            // let collision = 0 

            // if (this.range.positionWith(bpStart) == ContentRange.INSIDE) {
            //     newRange.setStart(setTo.container, setTo.offset)
            //     collision++
            // } 
            // if (this.range.positionWith(bpEnd) == ContentRange.INSIDE) {
            //     newRange.setEnd(setTo.container, setTo.offset)
            //     collision++
            // } 
            // if (collision > 0) {
            //     this.editorContext.editor.setSelection(newRange)
            // }
            if (this.range.positionWith(bpStart) == ContentRange.INSIDE 
                || this.range.positionWith(bpEnd) == ContentRange.INSIDE) {
                    this.element.contentEditable = 'false'
            }

        }
    }

    handleDelete (context: ICaretActionContext) {
        if (context.command == CaretActionContextCommand.Delete) {
            const range = context.range
            const bpStart = new BoundaryPoint(range.startContainer, range.startOffset)
            const pos = this.range.positionWith(bpStart)

            if (pos == ContentRange.RIGHT_ADJACENT || pos == ContentRange.LEFT_ADJACENT) {
                this.contextSubscription.unsubscribe()
                this.unmount()
            }  
        }
    }
}