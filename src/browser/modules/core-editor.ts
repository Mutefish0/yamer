import Component from 'base/component'
import { div, p, a } from 'base/element-creator'
import { Observable } from 'rx'
import { CharCode } from 'base/char-code'


//import config from 'src/config/editor-config'

//const { tab_size } = config

type Line = HTMLParagraphElement

function LineView () {
    return p({
        class: 'line-view',
        style: {
            'backgroundColor': 'gray',
            'color': 'white',
            'padding': 0,
            'margin': 0,
            'outline': 'none',
            'whiteSpace': 'pre',
            'lineHeight': '25px',
            'height': '25px'
        }
    })
}

function setRangeOffert (range: Range, offset: number, root,
     settingEnd?: boolean) {

}

export default class CoreEditor extends Component {
    private lines
    protected lineContainer: HTMLDivElement
    
    construct (fragment) {

        this.lineContainer = div({
                contenteditable: true,
                class: 'lien-container'
            })
        this.lines = this.lineContainer.childNodes

        this.appendLine()
        
        fragment.appendChild(this.lineContainer)
            
        return { }
    }
    
    wiring (els) {
        this.lineContainer.addEventListener('keydown', this.handleCarriageReturn.bind(this))
        this.lineContainer.addEventListener('keydown', this.handleBackSpace.bind(this))
        this.lineContainer.addEventListener('keydown', this.handleUpAndDownArrow.bind(this))
        this.lineContainer.addEventListener('keydown', this.handleTab.bind(this))
        // 获取粘贴板的纯文本，并且插入
        this.lineContainer.addEventListener('paste', e => {
            let plainText = e.clipboardData.getData('text/plain')
            let lines = plainText.split(/\r|\n|\r\n/)
            for (let i = 0; i < lines.length; i++) {
                this.insert(lines[i])
                if (i < lines.length - 1) {
                    this.break()
                }
            }
            e.preventDefault()
        })
    }


    /*---------------------------------------------------------------------------------------------
     *  line view mutations
     *--------------------------------------------------------------------------------------------*/
    private insertAfterLine (line: Line): Line {
        let newLine = LineView()
        let nextLine = this.getNextLine(line)
        if (nextLine) {
            this.lineContainer.insertBefore(newLine, nextLine)
        } else {
            this.appendLine(newLine)
        }

        return newLine
    }

    private insertBeforeLine (line: Line): Line {
        let newLine = LineView()
        this.lineContainer.insertBefore(newLine, line)
        return newLine
    }

    private appendLine (line?: Line): Line {
        let newLine = line ? line : LineView()
        this.lineContainer.appendChild(newLine)
        return newLine
    }

    private removeLine (line) {
        this.lineContainer.removeChild(line)
    }


    /*---------------------------------------------------------------------------------------------
     *  line view queries
     *--------------------------------------------------------------------------------------------*/
    private getLineNumber (line: Line) {
        return Array.prototype.indexOf.call(this.lines, line) + 1
    }

    private getLine (lineNumber: number) {
        return this.lines[lineNumber - 1]
    }

    private getPreviousLine (line?: Line): Line {
        let lastLine
        line = line || this.getFocusLine()
        for (let l of this.lines) {
            if (l == line) {
                return lastLine
            }
            lastLine = l
        }
        return null
    }

    private getNextLine (line: Line): Line {
        let lastLine = null
        for (let l of this.lines) {
            if (lastLine == line) {
                return l
            }
            lastLine = l
        }
        return null
    }


    /*---------------------------------------------------------------------------------------------
     *  line view content mutations
     *--------------------------------------------------------------------------------------------*/
    private insertContent (line, offset, content) {
        let innerText = line.innerText
        line.innerText = innerText.slice(0, offset) + content + innerText.slice(offset)
    }

    private deleteContent (line, from, to?) {
        let innerText = line.innerText
        to = to || innerText.length
        line.innerText = innerText.slice(0, from) + innerText.slice(to) 
        return innerText.slice(from, to)
    }

    private appendContent (line, content) {
        line.innerText = line.innerText + content
    }

    private prependContent (line, content) {
        line.innerText = content + line.innerText
    }


    /*---------------------------------------------------------------------------------------------
     *  cursor related ops
     *--------------------------------------------------------------------------------------------*/
    private getFocusLine (): Line {
        let line = window.getSelection().anchorNode
        line = line.nodeType == 3 ? line.parentNode : line
        return line as Line
    }

    private setFocusLine (lineOrNumber: number | Line, offset = 0) {
        let line = typeof lineOrNumber == 'number' ? this.getLine(lineOrNumber) : lineOrNumber
        offset = offset > line.innerText.length ? line.innerText.length : offset
        let range = document.createRange()
        
        range.selectNode(line)
        range.setEnd(line.firstChild || line, offset)
        range.collapse(false)

        let sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
    }

    /**
     * 获取光标相对其所在行首的字符偏移
     */
    private getCursorOffset () {
        return window.getSelection().anchorOffset
    }

    
    /*---------------------------------------------------------------------------------------------
     *  mixin
     *--------------------------------------------------------------------------------------------*/
    /**
     * 在光标处插入内容
     * @param content string
     */
    private insert (content) {
        let cursorOffset = this.getCursorOffset()
        let line = this.getFocusLine()
        this.insertContent(line, cursorOffset, content)
        this.setFocusLine(line, cursorOffset + content.length)
    }

    /**
     * 在光标处换行
     */
    private break () {
        let line = this.getFocusLine()
        let cursorOffset = this.getCursorOffset()
        let nextLine = this.insertAfterLine(line)
        this.appendContent(nextLine, this.deleteContent(line, cursorOffset))
        this.setFocusLine(nextLine)
    }


    /*---------------------------------------------------------------------------------------------
     *  intercept keyboard events
     *--------------------------------------------------------------------------------------------*/
    private handleCarriageReturn (e) {
        if (e.keyCode == CharCode.CarriageReturn && !e.ctrlKey) {
            this.break()
            e.preventDefault() 
        }
    }

    private handleBackSpace (e) {
        if (e.keyCode == CharCode.BackSpace) {
            let cursorOffset = this.getCursorOffset()
            if (cursorOffset == 0) {
                let line = this.getFocusLine()
                let prevLine = this.getPreviousLine(line)
                if (prevLine) {
                    let prevLineLength = prevLine.innerText.length
                    this.appendContent(prevLine, line.innerText)
                    this.setFocusLine(prevLine, prevLineLength)
                    this.removeLine(line)
                }
                e.preventDefault()
            }
        }
    }

    private handleUpAndDownArrow (e) {
        if (e.keyCode == CharCode.Up || e.keyCode == CharCode.Down) {
            let line = this.getFocusLine()
            let targetLine = e.keyCode == CharCode.Up ? this.getPreviousLine(line) : this.getNextLine(line)
            if (targetLine) {
                let cursorOffset = this.getCursorOffset() 
                this.setFocusLine(targetLine, cursorOffset)
                e.preventDefault()
            }
        }
    }

    private handleTab (e) {
        if (e.keyCode == CharCode.Tab) {
            let line = this.getFocusLine()
            if (this.detect(line, this.getCursorOffset())) {
                return
            }
            e.preventDefault()
        }
    }

    private detect (line, offset) {
        
    }

}