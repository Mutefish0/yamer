import Component from 'base/component'
import { div, p, a, span, text } from 'base/element-creator'
import { CharCode } from 'base/char-code'
import Rangy from 'browser/base/rangy'
import BoundaryPoint from 'browser/base/boundary-point'
import ContentRange from 'browser/base/content-range'
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
            editor: this,
            observables: {}
        }

        this.initializeEvents()

        this.setElement(this.container)
    }

    private initializeEvents () {
        this.container.addEventListener('focus', () => this.isFocused = true)
        this.container.addEventListener('blur', () => this.isFocused = false)

        const keydown = Observable.fromEvent(this.container, 'keydown')
        const sel = window.getSelection()

        const defaultCaretActionContext: ICaretActionContext = {
            range: new Range(),
            direction: CaretActionContextDirection.RTL,
            command: CaretActionContextCommand.CaretChange,
            event: null 
        }
        
        
        const selectionChange = Observable
        .fromEvent(document, 'selectionchange')
        .scan((prev, curr) => {
            const currRange = sel.getRangeAt(0)
            let comparation = currRange.compareBoundaryPoints(Range.END_TO_END, prev.range)
            if (comparation == 0) {
                comparation = currRange.compareBoundaryPoints(Range.START_TO_START, prev.range)   
            }
            return {
                range: currRange,
                direction: comparation > 0 ? CaretActionContextDirection.LTR : CaretActionContextDirection.RTL
            }
        }, { range: new Range(), direction: CaretActionContextDirection.LTR })
        .filter(() => {
            if (this.isFocused) { 
                if (this.caretChangeBuffer > 0) {
                    this.caretChangeBuffer--
                    return false
                } else {
                    return true
                }
            } else {
                return false 
            }
        })
        .map(simpleCaretAction => Object.assign({}, simpleCaretAction, {
            command: CaretActionContextCommand.CaretChange,
            event: null
        }))

        // const deleteAction = keydown
        // .filter(e => e.keyCode == CharCode.BackSpace)
        // .map(e => {
        //     let currRange = sel.getRangeAt(0)
        //     return {
        //         range: currRange,
        //         direction: CaretActionContextDirection.RTL,
        //         command: CaretActionContextCommand.Delete,
        //         event: e 
        //     }
        // })

        const tabAction = keydown
        .filter(e => e.keyCode == CharCode.Tab)
        .map(e => {
            let currRange = sel.getRangeAt(0)
            return {
                range: currRange,
                direction: CaretActionContextDirection.RTL,
                command: CaretActionContextCommand.Delete,
                event: e 
            }
        })

        // const returnAction = keydown
        // .filter(e => e.keyCode == CharCode.CarriageReturn)
        // .map(e => {
        //     let currRange = sel.getRangeAt(0)
        //     return {
        //         range: currRange,
        //         direction: CaretActionContextDirection.RTL,
        //         command: CaretActionContextCommand.Delete,
        //         event: e 
        //     }
        // })

        this.editorContext.observables = { /*tabAction, deleteAction, returnAction, */selectionChange }

        tabAction.subscribe(this.handleTab.bind(this))     
    }

    public setSelection (range: Range) {
        const selection = window.getSelection()

        this.caretChangeBuffer += 2
        selection.removeAllRanges()
        selection.addRange(range)
    }

    handleTab (context) {
        // if (e.keyCode == CharCode.Tab) {
        //     this.infer()
        //     e.preventDefault();
        // }
        this.infer()
        context.event.preventDefault()
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



