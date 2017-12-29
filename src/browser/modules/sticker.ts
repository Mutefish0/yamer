import { div, p, a, span, text } from 'base/element-creator'
import Component from 'base/component'
import RangeMarker, { MarkerSource } from 'browser/base/range-marker'
import Caret from 'browser/base/caret'

export default class Sticker extends Component { 
    private editorContext 
    private rightGutter: HTMLElement
    private panel

    private rightMarker: RangeMarker

    private pannelMarker: RangeMarker

    constructor(arg1, editorContext) {
        super()
        this.editorContext = editorContext

        this.panel = span({ 
            contentEditable: false, 
            style: { 
                color: 'indianred',
                fontWeight: 'bold'
            }
        })

        this.rightGutter = span({ textContent: '\u001A', contentEditable: true }) 
        this.panel.appendChild(text('hello'))
        this.panel.appendChild(this.rightGutter)

        this.setElement([this.panel, this.rightGutter])
    }

    didMounted () {
        const rightGutterRange = new Range()

        rightGutterRange.selectNodeContents(this.rightGutter.firstChild)

        this.rightMarker = new RangeMarker(rightGutterRange, this.editorContext.container)
        this.pannelMarker = new RangeMarker(this.panel, this.editorContext.container)

        this.subscribeSources()
    }

    private subscribeSources () {
        this.rightMarker.subscribe(MarkerSource.CaretAdjacentLeft, ({ direction }) => {
            if (direction > 0) {
                Caret.collapse(this.rightMarker.rightBoundary)
            } else {
                Caret.collapse(this.pannelMarker.leftBoundary)
            }
        })
    } 

} 