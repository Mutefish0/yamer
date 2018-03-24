import React from 'react'
import { MAST, Block, Inline, Heading, ListItem, Blockquote, Paragraph } from 'libs/markdown'
import hljs from 'highlight.js'
import Caret from 'base/caret'
import classNames from 'classnames'

const LINE_HEIGHT = 22

interface Point {
    offset: number
    line: number
    column: number
}

interface Location {
    start: Point
    end: Point
}

const cursorSplitElement = (selectionRange, captureCursorClick, source, location) => {
    const sStart = selectionRange[0]
    const sEnd = selectionRange[1]
    const iStart = location.start.offset
    const iEnd = location.end.offset

    const noneSelected =
        sEnd < iStart
        || sStart > iEnd
    let innerView

    if (noneSelected) {
        innerView = source.slice(iStart, iEnd)
    } else {
        const leftCut = Math.max(sStart, iStart)
        const rightCut = Math.min(sEnd, iEnd)
        const isCollapsed = leftCut == rightCut

        innerView = [
            <span
                key='0' onClick={captureCursorClick}
                data-range={[iStart, leftCut]}
            >
                {source.slice(iStart, leftCut)}
            </span>,
            <span
                key='1' className='selected'
                onClick={captureCursorClick} data-range={[leftCut, rightCut]}
            >
                {
                    isCollapsed ?
                        <span className='cursor'></span>
                        : source.slice(leftCut, rightCut)
                }
            </span>,
            <span
                key='2' onClick={captureCursorClick}
                data-range={[rightCut, iEnd]}
            >
                {source.slice(rightCut, iEnd)}
            </span>
        ]
    }
    return innerView 
}


const leafElement = (selectionRange, captureCursorClick, source, leaf, index) => {
    return (
        <span
            className={leaf.type} 
            key={index}
            data-range={[leaf.location.start.offset, leaf.location.end.offset]}
            onClick={captureCursorClick}
        >
            {cursorSplitElement(selectionRange, captureCursorClick, source, leaf.location)}
        </span>
    )
}

const prefixElement = (source, block, captureCursorClick, selectionRange) => {
    let start = block.children[0].location.start.offset 
    let _start = block.location.start.offset
    return (
        <span 
            className={`${block.type}-prefix`} 
            key='prefix'
            onClick={captureCursorClick}
            data-range={[_start, start]}
        >
            {cursorSplitElement(selectionRange, captureCursorClick, source, { start: { offset: _start }, end: { offset: start } })}
        </span>
    )
}

const suffixElement = (source, block, captureCursorClick, selectionRange) => {
    let end = block.children[block.children.length - 1].location.end.offset
    let _end = block.location.end.offset
    return (
        <span 
            className={`${block.type}-suffix`} 
            key='suffix' 
            onClick={captureCursorClick}
            data-range={[end, _end]}
        >
            {cursorSplitElement(selectionRange, captureCursorClick, source, { start: { offset: end }, end: { offset: _end } })}
        </span>
    )
}

const block2ReactElement = (selectionRange, captureCursorClick, source, block: Block, index) => {
    switch (block.type) {
        case 'blockquote':
            return (
                <span key={index} className={block.type}>
                    {block.children.map(block2ReactElement.bind({}, selectionRange, captureCursorClick, source)) }
                </span>
            )
        case 'blockquote_unit':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block, captureCursorClick, selectionRange)}
                    {block.children.map(block2ReactElement.bind({}, selectionRange, captureCursorClick, source))}
                    {suffixElement(source, block, captureCursorClick, selectionRange)}
                </span>
            )
        case 'paragraph':
        case 'heading':
        case 'list_item':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block, captureCursorClick, selectionRange)}
                    {block.children.map(leafElement.bind({}, selectionRange, captureCursorClick, source))}
                    {suffixElement(source, block, captureCursorClick, selectionRange)}
                </span>
            )
        case 'link_reference_definition':
        case 'thematic_break':
        case 'blank_lines':
            return leafElement(selectionRange, captureCursorClick, source, block, index)
        case 'code_block':
            return (
                <span 
                    key={index} className={block.type} 
                    data-range={[block.location.start.offset, block.location.end.offset]}
                >
                    {prefixElement(source, block, captureCursorClick, selectionRange)}
                    {leafElement(selectionRange, captureCursorClick, source, block.children[0], index)}
                    {suffixElement(source, block, captureCursorClick, selectionRange)}
                </span>
            )
        case 'list':
            return (
                <span key={index} className={block.type}>
                    {block.children.map(block2ReactElement.bind({}, selectionRange, captureCursorClick, source))}
                </span>
            )
        default:
            return undefined
    }  
}

const ast2ReactElement = (source: string, ast: Block[], captureCursorClick, selectionRange) => {
    return ast.map(block2ReactElement.bind({}, selectionRange, captureCursorClick, source))
}


interface Props {
    ast: MAST, 
    onCursorChange: Function,
    selectionRange: [number, number]
}

interface State {
    isCursorSleep: boolean,
    isFocused: boolean
}

class ShadowEditor extends React.Component<Props, State> {
    constructor (props) {
        super(props)
        this.state = {
            isCursorSleep: true,
            isFocused: false
        }
        let self = this as any 
        self.cursorSleepTimeout = null 
        self.previousReceivedCursorRange = this.props.selectionRange
    }

    captureCursorClick (e) {
        const range = Caret.getRange()

        const startContainer = range.startContainer.parentElement
        const endContainer = range.endContainer.parentElement

        const baseStartOffset = parseInt(startContainer.getAttribute('data-range').split(',')[0])
        const baseEndOffset = parseInt(endContainer.getAttribute('data-range').split(',')[0])

        let cursorRange = [baseStartOffset + range.startOffset, baseEndOffset + range.endOffset]
        const prevRange = (this as any).previousReceivedCursorRange

        //shift点击选中适配
        if (e.shiftKey) {
            cursorRange = [Math.min(cursorRange[0], prevRange[0]), Math.max(cursorRange[1], prevRange[1])]
        }
        
        this.props.onCursorChange(cursorRange)
        
        let self = this as any
        self.previousReceivedCursorRange = cursorRange
        
        e.stopPropagation()
        e.preventDefault()
    }

    componentWillReceiveProps (nextProps) {
        const newRange = nextProps.selectionRange
        const range = this.props.selectionRange
        if (newRange[0] != range[0] || newRange[1] != range[1]) {
            this.setState({isCursorSleep: false})
            clearTimeout((this as any).cursorSleepTimeout)
            setTimeout(() => this.setState({isCursorSleep: true }), 800)
        }
    }

    setCursorByClick (e) {
        const pre = this.refs['pre'] as any
        const source = this.props.ast.source
        const rect = pre.getBoundingClientRect()
        const rows = source.split('\n')

        let row = (e.pageY - rect.top) / LINE_HEIGHT 
        row = row > 0 ? Math.ceil(row) : 1
        row = row > rows.length ? rows.length : row

        const toStart = e.pageX < rect.left

        const end = rows.slice(0, row).join('\n').length 
        const start = end - rows[row - 1].length

        const pos = toStart ? start : end

        this.props.onCursorChange([pos, pos])
    } 

    render () {
        let view = ast2ReactElement(
            this.props.ast.source, 
            this.props.ast.entities,
            this.captureCursorClick.bind(this), 
            this.props.selectionRange
        )
        return (
            <div className="shadow-editor" onClick={this.setCursorByClick.bind(this) }>
                <pre 
                    className={classNames([
                        { 'cursor-sleep': this.state.isCursorSleep},
                        {'focused': this.state.isFocused}
                    ])}
                    ref="pre"
                >
                {view}
                </pre>
            </div>
        )
    }
}

export default ShadowEditor