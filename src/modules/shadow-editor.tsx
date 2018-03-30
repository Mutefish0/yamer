import React from 'react'
import { MAST, Block, Inline, Heading, ListItem, Blockquote, Paragraph } from 'libs/markdown'
import hljs from 'highlight.js'
import Caret from 'base/caret'
import classNames from 'classnames'

const LINE_HEIGHT = 22
const PADDING = 14 

interface Point {
    offset: number
    line: number
    column: number
}

interface Location {
    start: Point
    end: Point
}

const cursorSplitElement = (selectionRange, source, location) => {
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

        if (!isCollapsed) {
            innerView = [
                <span
                    key='0'
                    data-range={[iStart, leftCut]}
                >
                    {source.slice(iStart, leftCut)}
                </span>,
                <span
                    key='1' className='selected'
                    data-range={[leftCut, rightCut]}
                >
                    {
                        source.slice(leftCut, rightCut)
                    }
                </span>,
                <span
                    key='2'
                    data-range={[rightCut, iEnd]}
                >
                    {source.slice(rightCut, iEnd)}
                </span>
            ]
        } else {
            innerView = (
                <span data-max={source.length} data-range={[iStart, iEnd]} data-cursor-offset={leftCut - iStart}>
                    {source.slice(iStart, iEnd)}
                </span>
            )
        }
    }
    return innerView 
}


const leafElement = (selectionRange, source, leaf, index) => {
    switch (leaf.type) {
        case 'link':
            return (
                <span
                    className={leaf.type}
                    key={index}
                >
                    {prefixElement(source, leaf, selectionRange)}
                    <span className="link-child">
                        {leaf.children.map(leafElement.bind({}, selectionRange, source))}
                    </span>
                    {suffixElement(source, leaf, selectionRange)}
                </span>
            )
        default:
            return (
                <span
                    className={leaf.type}
                    key={index}
                    data-range={[leaf.location.start.offset, leaf.location.end.offset]}
                >
                    {cursorSplitElement(selectionRange, source, leaf.location)}
                </span>
            )
    }
}

const reactElement = (source, selectionRange, location, reactLocation) => {
    const start = location.start.offset
    const end = location.end.offset
    const rStart = reactLocation.start.offset
    const rEnd = reactLocation.end.offset

    return [
        <span key="0" data-range={[start, rStart]}>{cursorSplitElement (selectionRange, source, { start: { offset: start }, end: { offset: rStart } })}</span>,
        <span key="1" className="reaction" data-range={[rStart, rEnd]}>{cursorSplitElement(selectionRange, source, { start: { offset: rStart }, end: { offset: rEnd } })}</span>,
        <span key="2" data-range={[rEnd, end]}>{cursorSplitElement(selectionRange, source, { start: { offset: rEnd }, end: { offset: end } })}</span>
    ]
}

const prefixElement = (source, block, selectionRange) => {
    let start = block.children[0].location.start.offset 
    let _start = block.location.start.offset
    let fakeLocation = { start: { offset: _start }, end: { offset: start } }
    if (start == _start) return undefined;
    return (
        <span 
            className={`${block.type}-prefix`} 
            key='prefix'
            data-range={[_start, start]}
        >
            {
                block.reactLocation ? reactElement(source, selectionRange, fakeLocation, block.reactLocation)
                    : cursorSplitElement(selectionRange, source, fakeLocation)
            }
        </span>
    )
}

const suffixElement = (source, block, selectionRange) => {
    let end = block.children[block.children.length - 1].location.end.offset
    let _end = block.location.end.offset
    if (end == _end) return undefined;
    return (
        <span 
            className={`${block.type}-suffix`} 
            key='suffix' 
            data-range={[end, _end]}
        >
            {cursorSplitElement(selectionRange, source, { start: { offset: end }, end: { offset: _end } })}
        </span>
    )
}

const block2ReactElement = (selectionRange, source, block: Block, index) => {
    switch (block.type) {
        case 'blockquote':
            return (
                <span key={index} className={block.type}>
                    {block.children.map(block2ReactElement.bind({}, selectionRange, source)) }
                </span>
            )
        case 'blockquote_unit':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block, selectionRange)}
                    {block.children.map(block2ReactElement.bind({}, selectionRange, source))}
                    {suffixElement(source, block, selectionRange)}
                </span>
            )
        case 'paragraph':
        case 'heading':
        case 'list_item':
        case 'list_task_item':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block, selectionRange)}
                    {block.children.map(leafElement.bind({}, selectionRange, source))}
                    {suffixElement(source, block, selectionRange)}
                </span>
            )
        case 'thematic_break':
        case 'blank_lines':
            return leafElement(selectionRange, source, block, index)
        case 'code_block':
        case 'link_reference_definition':
            return (
                <span 
                    key={index} className={block.type}
                >
                    {prefixElement(source, block, selectionRange)}
                    {leafElement(selectionRange, source, block.children[0], index)}
                    {suffixElement(source, block, selectionRange)}
                </span>
            )
        case 'list':
            return (
                <span key={index} className={block.type}>
                    {block.children.map(block2ReactElement.bind({}, selectionRange, source))}
                </span>
            )
        default:
            return undefined
    }  
}

const ast2ReactElement = (source: string, ast: Block[], selectionRange) => {
    return ast.map(block2ReactElement.bind({}, selectionRange, source))
}

interface Props {
    ast: MAST, 
    onCursorChange: Function,
    selectionRange: [number, number],
    focused: boolean
}

interface State {
    isCursorSleep: boolean
}

class ShadowEditor extends React.Component<Props, State> {
    private cursorSleepTimeout
    private previousReceivedCursorRange

    constructor (props) {
        super(props)
        this.state = {
            isCursorSleep: true
        }
        this.cursorSleepTimeout = null 
        this.previousReceivedCursorRange = this.props.selectionRange
    }

    componentWillReceiveProps (nextProps) {
        const newRange = nextProps.selectionRange
        const range = this.props.selectionRange
        if (newRange[0] != range[0] || newRange[1] != range[1]) {
            this.setState({isCursorSleep: false})
            clearTimeout(this.cursorSleepTimeout)
            setTimeout(() => this.setState({isCursorSleep: true }), 800)
        }
    }

    setCursorByClickTextContent (e) {
        const range = Caret.getRange()

        const startContainer = range.startContainer.parentElement
        const endContainer = range.endContainer.parentElement

        const sRang = startContainer.getAttribute('data-range')
        const eRange = endContainer.getAttribute('data-range')

        if (sRang && eRange) {
            const baseStartOffset = parseInt(sRang.split(',')[0])
            const baseEndOffset = parseInt(eRange.split(',')[0])

            let cursorRange = [baseStartOffset + range.startOffset, baseEndOffset + range.endOffset]
            const prevRange = this.previousReceivedCursorRange

            //shift点击选中适配
            if (e.shiftKey) {
                cursorRange = [Math.min(cursorRange[0], prevRange[0]), Math.max(cursorRange[1], prevRange[1])]
            }

            this.props.onCursorChange(cursorRange)
            this.previousReceivedCursorRange = cursorRange
        }

        e.stopPropagation()
        e.preventDefault()
    }

    componentDidUpdate () {
        const cursorHost = document.querySelector('span[data-cursor-offset]') as any
        const cursor = this.refs['cursor'] as any
        if (cursorHost) {
            const textHost = cursorHost.childNodes[0]
            if (textHost) {
                const baseOffset = cursorHost.getAttribute('data-range').split(',')[0]
                const offset = cursorHost.getAttribute('data-cursor-offset')
                const prevCharOffset = parseInt(baseOffset) + parseInt(offset);
                const range = document.createRange()
                range.setStart(textHost, offset)
                range.setEnd(textHost, offset)
                var rect = range.getBoundingClientRect()
                const prevChar = this.props.ast.source.slice(prevCharOffset - 1, prevCharOffset)
                // 如果前一个字符为'\n'则换行
                if (prevChar == '\n') {
                    cursor.style.left = PADDING + 'px'
                    cursor.style.top = rect.top + LINE_HEIGHT + 'px'
                } else {
                    cursor.style.left = rect.left + 'px'
                    cursor.style.top = rect.top + 'px'
                }
            }
        }
    }

    render () {

        let view = ast2ReactElement(
            this.props.ast.source, 
            this.props.ast.entities,
            this.props.selectionRange
        )
        return (
            <div 
                onClick={this.setCursorByClickTextContent.bind(this)}

                className={classNames([
                    'shadow-editor',
                    { 'cursor-sleep': this.state.isCursorSleep},
                    {'focused': this.props.focused }
                ])}
                ref="pre"
                >
                {view}
                <i className="cursor" ref="cursor"/>
            </div>
        )
    }
}

export default ShadowEditor