import Component from 'base/component'
import { div, p, a } from 'base/element-creator'

function LineView () {
    return p({
        class: 'line-view',
        contenteditable: true,
        style: {
            'backgroundColor': 'gray',
            'color': 'white',
            'padding': 0,
            'margin': 0,
            'outline': 'none',
            'whiteSpace': 'pre'
        } 
    })
}

export default class CoreEditor extends Component {
    private lines: HTMLParagraphElement[]
    private lineContainer: HTMLDivElement
    
    construct (fragment) {

        this.lineContainer = div({
                class: 'lien-container'
            })
        this.lines = []

        this.appendLine()
        this.appendLine() 
        
        
        fragment.appendChild(this.lineContainer)

        return { }
    }
    
    wiring (els) {

    }

    insertLine (lineNumber: number, before: boolean = false) {
        let newLine = LineView()
        if (!before) {
            lineNumber += 1
        }
        if (lineNumber == this.lines.length) {
            this.lineContainer.appendChild(newLine)
            this.lines.push(newLine)
        } else if (lineNumber > 0) {
            let refLine = this.lines[lineNumber - 1]
            this.lineContainer.insertBefore(newLine, refLine)
            this.lines.splice(lineNumber - 1, 0, newLine)
        } 
    }

    insertAfterLine (lineNumber: number) {
        this.insertLine(lineNumber)
    }

    insertBeforeLine (lineNumber: number) {
        this.insertLine(lineNumber, true)
    }

    appendLine () {
        let newLine = LineView()
        this.lineContainer.appendChild(newLine)
        this.lines.push(newLine)
    }
}