import { div, p, a, span, text } from 'base/element-creator'
import Component from 'base/component'
import RangeMarker, { MarkerSource } from 'browser/base/range-marker'
import { Boundary } from 'browser/base/boundary-point'
import Caret from 'browser/base/caret'
import { Subscription } from 'rxjs/Rx';

export default class Sticker extends Component { 
    private editorContext 
    private rightGutter: Text
    private panel

    private childInputElement
    private childComponent

    private rightMarker: RangeMarker
    private inputMarker: RangeMarker 
    private pannelMarker: RangeMarker

    private deleteSubscription: Subscription
    private returnSubscription: Subscription

    constructor(childComponent, editorContext) {
        super()
        this.editorContext = editorContext

        this.panel = span({
            contentEditable: false
        })

        this.rightGutter = text('\u001A')
        childComponent.mount(this.panel)
        
        this.childComponent = childComponent 
        this.childInputElement = childComponent.getInputElement()

        this.setElement([this.panel]) 
    }

    didMounted () {
        //const rightGutterRange = new Range()

        //rightGutterRange.selectNodeContents(this.rightGutter)

        //this.rightMarker = new RangeMarker(rightGutterRange, this.editorContext.container)
        this.pannelMarker = new RangeMarker(this.panel, this.editorContext.container)
        this.inputMarker = new RangeMarker(this.childInputElement, this.panel) 

        Caret.collapseToElement(this.childInputElement)

        this.subscribeSources()
    }
 
    private subscribeSources () {
        // this.rightMarker.subscribe(MarkerSource.CaretAdjacentLeft, ({ direction }) => {
        //     if (direction > 0) {
        //         Caret.collapse(this.rightMarker.rightBoundary)
        //     } else {
        //         console.log('foucus')
        //         Caret.collapseToElement(this.childInputElement)
        //     }
        // })

        this.pannelMarker.subscribe(MarkerSource.CaretIn, () => {
            this.childComponent.onFocus()
        })

        this.pannelMarker.subscribe(MarkerSource.CaretOut, () => {
            this.childComponent.onBlur()
        })

        this.deleteSubscription =  this.editorContext.observables.deleteAction.subscribe(e => {
            if (this.inputMarker.isLeftAdjacent) {
                if (this.childInputElement.innerText.length) {
                    e.preventDefault()
                } else {
                    Caret.collapse(this.pannelMarker.leftBoundary)
                    this.unmount()
                    e.preventDefault()
                }
            } else if (this.rightMarker.isRightAdjacent) {
                Caret.collapseToElement(this.childInputElement)
                e.preventDefault()
            }
        })

        // this.returnSubscription = this.editorContext.observables.returnAction.subscribe((e) => {
        //     if (this.pannelMarker.isInside) {
        //         e.preventDefault()
        //     } 
        // })
    } 

    willUnmount () {
        // rightGutter was modified after input, we should'nt unmount the whole of it.
        this.rightGutter.textContent.replace(/\u001A/, '')
        this.setElement(this.panel)

        this.deleteSubscription.unsubscribe()
        this.returnSubscription.unsubscribe()

        this.pannelMarker.dispose()
        this.rightMarker.dispose()
        this.inputMarker.dispose()
    }

} 