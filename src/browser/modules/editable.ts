import Component from 'base/component'
import { div, p, a, span, text } from 'base/element-creator'
import { Observable } from 'rx'
import { CharCode } from 'base/char-code'


export default class Editable extends Component {
    private container
    private lookback = 4
    private tabLength = 4

    private uuid = 0

    build (fragment) {
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
        fragment.appendChild(this.container)
        
        this.container.addEventListener('keydown', this.handleTab.bind(this))
    }

    handleTab (e) {
        if (e.keyCode == CharCode.Tab) {
            this.infer()
            e.preventDefault();
        }
    }

    symbolize (text) {

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

            //range.collapse(false)

            let bold = span({style: {'fontWeight': 'bold'}})
            bold.textContent = '加粗'
            range.insertNode(bold)

        } else {
            range.collapse(false)
            
        }

        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
        
    }
}


/**
 * 由一串字符组成的一个整体
 * 光标只能在其两侧，而不能在内部
 * 删除操作会删除整体
 */
class Sticker {
    private el: HTMLElement
    
    constructor (text) {
        this.el = span({ textContent: text })
    }

    onKeydown () {

    }
}

class Cursor {
    static selection: Selection

    static getWindowSelection (): Selection {
        return Cursor.selection = Cursor.selection || window.getSelection()
    }

    static getCurrentCursor () {
        let selection = Cursor.getWindowSelection()
        let range = selection.getRangeAt[0]
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






class InlinePlaceholder extends Component {
    private symbol: InlineSymbol
    private state: PlaceholderState
    private beginSymbolRange: Range
    private endSymbolRange: Range
    
    constructor (symbol: InlineSymbol) {
        super()
        this.symbol = symbol 
        this.state = PlaceholderState.Forming
    }

    build (fragment) {
        let el = span()

        switch (this.symbol) {
            case InlineSymbol.Emphasis:
            case InlineSymbol.Italic:
            case InlineSymbol.Strikethrough:
            
            case InlineSymbol.Code:

            case InlineSymbol.Link:
            case InlineSymbol.Image: 
        }
    }
}

class Detector {

}

