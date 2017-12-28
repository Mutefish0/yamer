import Component from 'base/component'
import { div, p, a, span, text } from 'base/element-creator'
import { CharCode } from 'base/char-code'
import Sticker from './sticker'
import { Observable } from 'rxjs/Rx'

export enum CaretActionContextDirection {
    LTR,
    RTL
}

export enum CaretActionContextCommand {
    CaretChange,
    Delete,
    Tab,
    Return
}

export interface ICaretActionContext {
    range: Range 
    direction: CaretActionContextDirection,
    command: CaretActionContextCommand,
    event: Event
}


export default class Editable extends Component {
    private container: HTMLElement
    private lookback = 4
    private tabLength = 4

    private uuid = 0

    private isFocused: boolean = false

    private editorContext

    private caretChangeBuffer = 0 

    constructor () {
        super()

        this.container = div({
            class: 'editable-core',
            contenteditable: true,
            style:  {
                'backgroundColor': 'gray',
                'color': 'white',
                'padding': 0,
                'margin': 0,
                'outline': 'none',
                'whiteSpace': 'pre',
                'lineHeight': '25px'
            }
        })

        this.editorContext = {
            container: this.container,
            editor: this,
            observables: {}
        }

        this.initializeEvents()

        this.setElement(this.container)
    }

    private initializeEvents () {
        const keydown = Observable.fromEvent(this.container, 'keydown')
        

        const deleteAction = keydown
        .filter(e => e.keyCode == CharCode.BackSpace)

        const tabAction = keydown
        .filter(e => e.keyCode == CharCode.Tab)

        const returnAction = keydown
        .filter(e => e.keyCode == CharCode.CarriageReturn)

        this.editorContext.observables = { tabAction, deleteAction, returnAction }

        tabAction.subscribe(this.handleTab.bind(this))     
    }

    handleTab (e) {
        this.infer()
        e.preventDefault()
    }

    infer () {
        let sel = window.getSelection()
        let selRange = sel.getRangeAt(0)
        let range = selRange.cloneRange()
        range.setStart(range.commonAncestorContainer, range.endOffset < this.lookback ? 0 : range.endOffset - this.lookback)
        let context = range.toString()
        

        if (/\*\*$|--$/.test(context)) {
            range.setStart(range.commonAncestorContainer, range.endOffset - 2)
            range.deleteContents()

            range.collapse(false)

            const solidSpan = span({
                textContent: '加粗',
                style: {
                    backgroundColor: 'rgba(90,120,75,0.5)'
                }
            })

            const sticker = new Sticker(solidSpan, this.editorContext)

            sticker.mount(range) 
        } else {
            range.collapse(false)
        }

        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
        
    }
}


enum InlineSymbol {
    Code,
    Emphasis,
    Italic,
    Strikethrough,
    Link,
    Image
}

enum LeafBlockSymbol {
    Heading,
    HorizontalLine,
    CodeBlock,
    Paragraph
}

enum ContainerBlockSymbol {
    Blockquote,
    UnorderedList
}

enum PlaceholderState {
    Forming,  // symbol未闭合 文字颜色变浅
    Stable    // 非编辑状态 文字颜色正常
}

//const rules:






// class InlinePlaceholder extends Component {
//     private symbol: InlineSymbol
//     private state: PlaceholderState
//     private beginSymbolRange: Range
//     private endSymbolRange: Range
    
//     constructor (symbol: InlineSymbol) {
//         super()
//         this.symbol = symbol 
//         this.state = PlaceholderState.Forming
//     }

//     // build (fragment) {
//     //     let el = span()

//     //     switch (this.symbol) {
//     //         case InlineSymbol.Emphasis:
//     //         case InlineSymbol.Italic:
//     //         case InlineSymbol.Strikethrough:
            
//     //         case InlineSymbol.Code:

//     //         case InlineSymbol.Link:
//     //         case InlineSymbol.Image: 
//     //     }
//     // }
// }



