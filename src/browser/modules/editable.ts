import Component from 'base/component'
import { div, p, a, span, text } from 'base/element-creator'
import { Observable } from 'rx'
import { CharCode } from 'base/char-code'

/**
 * 在Range类的基础上新增比较有用的方法
 * @NOTE 暂未考虑包含Comment, CDATA等节点的情况
 */
class Rangy extends Range {
    static selection: Selection = window.getSelection()
    /**
     * 从光标或选中对象处克隆出一个Rangy对象
     */
    static fromWindowSelection (): Rangy {
        return Rangy.fromRangeLike(Rangy.selection.getRangeAt(0))
    }

    /**
     * 由Range或Rangy对象克隆出一个Rangy对象 
     */
    static fromRangeLike (range: Range | Rangy): Rangy {
        let rangy = new Rangy()

        rangy.setStart(range.startContainer, range.startOffset)
        rangy.setEnd(range.endContainer, range.endOffset)

        return rangy 
    }

    public clone () {
        return Rangy.fromRangeLike(this)
    }

    /**
     * boundary point += count
     */
    public extendLeftBoundary (count: number): boolean {
            if (count == 0) {
                return true
            } else if (count < 0) {
                return false
            } // ensure count >= 1 

            let leftContainer = this.startContainer
            let leftOffset = this.startOffset

            if (leftContainer instanceof Text) {
                if (leftOffset >= count) {
                    this.setStart(leftContainer, leftOffset - count)
                    return true
                } else { 
                    // go out 
                    let parent = leftContainer.parentNode
                    if (parent) {
                        this.setStart(parent, Array.prototype.indexOf.call(parent.childNodes, leftContainer))
                        return this.extendLeftBoundary(count - leftOffset - 1)
                    } else {
                        return false
                    }
                }
            } else if (leftContainer.nodeType == 1) {
                if (leftOffset > 0) { 
                    // go in
                    let child = leftContainer.childNodes[leftOffset - 1]
                    this.setStart(child, child.childNodes.length)
                    return this.extendLeftBoundary(count - 1)
                } else { // offset == 0
                    // go out
                    let parent = leftContainer.parentNode
                    if (parent) {
                        this.setStart(parent, Array.prototype.indexOf.call(parent.childNodes, leftContainer))
                        return this.extendLeftBoundary(count - 1)
                    } else {
                        return false
                    }
                }
            } else {
                throw new Error('UnexpectedNodeType')
            }
    }
  
    public extendedLeftBoundary (count: number): Rangy {
        let clonedRangy = this.clone()
        if (clonedRangy.extendLeftBoundary(count)) {
            return clonedRangy
        } else {
            return null
        }
    }

    public extendRightBoundary (count: number): boolean {
        try {
            return true
        } catch (e) {
            return false
        }
    }

    public extendLeftContent (count: number): boolean {
        try {
            return true
        } catch (e) {
            return false
        }
    }

    public extendRightContent (count: number): boolean {
        try {
            return true
        } catch (e) {
            return false
        }
    }
}

var r = new Rangy()
window.r = r

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
            bold.innerText = '加粗'
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
        this.el = span({ innerText: text })
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

