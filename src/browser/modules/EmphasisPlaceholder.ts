import Component from 'base/component'
import { div, p, a, span, text, input } from 'base/element-creator'

class EmphasisPlaceholder extends Component {
    private inputBox
    private el
    private leftText
    private rightText

    constructor() {
        super()
        this.el = span({
            class: 'inline emphasis active'
        })
        this.inputBox = span({
            contentEditable: true
        })
        this.leftText = text('**')
        this.rightText = text('**')
        this.el.appendChild(this.leftText)
        this.el.appendChild(this.inputBox)
        this.el.appendChild(this.rightText)
        this.setElement(this.el)
    }

    public onFocus () {
        const className = this.el.getAttribute('class')
        this.el.setAttribute('class', className.replace('inactive', 'active'))
        this.leftText.textContent = '**'
        this.rightText.textContent = '**'
    }

    public onBlur () {
        const className = this.el.getAttribute('class')
        this.el.setAttribute('class', className.replace('active', 'inactive'))
        this.leftText.textContent = '\u001A'
        this.rightText.textContent = '\u001A'
    }

    public getInputElement () {
        return this.inputBox
    }
}

export default EmphasisPlaceholder
