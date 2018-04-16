import React from 'react'
import { MAST, Abstract } from 'libs/markdown'
import hljs from 'highlight.js'
import Caret from 'browser/base/caret'
import classNames from 'classnames'

import Cursor from './svg/Cursor'

const LINE_HEIGHT = 14 * 1.4
const PADDING = 14 

interface Props {
    ast: MAST, 
    onCursorChange: Function,
    selectionRange: [number, number],
    focused: boolean
}

interface State {
    isCursorSleep: boolean
}

const slice = String.prototype.slice

const attachSelection = (source, range, selectionRange, key, className='') => {
    
    const collapsed = selectionRange[0] == selectionRange[1]
    const leftJoin = Math.max(range[0], selectionRange[0])
    const rightJoin = Math.min(range[1], selectionRange[1])
    if (collapsed) {
        const props = { key, className, 'data-range': range }
        if ( selectionRange[0] >= range[0] && selectionRange[0] <= range[1]) {
            props['data-cursor-offset'] = selectionRange[0] - range[0]
        } 
        return <span {...props}>{slice.apply(source, range)}</span>
    } else if (leftJoin < rightJoin) {
        const ranges = [
            [range[0], leftJoin],
            [leftJoin, rightJoin],
            [rightJoin, range[1]]
        ]
        const classNames = ['', 'selected', '']
        let children = [0, 1, 2].map(i => {
            const className = classNames[i], range = ranges[i]
            return range[0] < range[1] && (
                <span key={i} className={className} data-range={range}>
                    {slice.apply(source, range)}
                </span>
            )
        })
        return (
            <span key={key} className={className} data-range={range}>{children}</span>
        )
    } 
}

const astUnit2ReactElement = (source, unit: Abstract, index, selectionRange) => {
    let children: any = unit.children 
        ? ast2ReactElements(source, unit.children, selectionRange, index)
        : attachSelection(source, unit.range, selectionRange, index, unit.type)

    let views = []
    if (unit.ranges) {
        let cursor = unit.range[0]
        for (let key in unit.ranges) {
            var range = unit.ranges[key]
            if (cursor < range[0]) {
                views.push(attachSelection(source, [cursor, range[0]], selectionRange, index))
                cursor = range[0]
            }
            if (range[0] < range[1]) {
                if (key == 'children') {
                    views = views.concat(children)
                } else {
                    const splitKey = key.split('children#')
                    if (splitKey[0] == '') {
                        views.push(
                            <span key={cursor} data-range={range} className={splitKey[1]}>
                                {children}
                            </span>
                        )
                    } else {
                        views.push(attachSelection(source, range, selectionRange, index, splitKey[0]))
                    }
                }
                cursor = range[1]
            }
        }
        if (cursor < unit.range[1]) {
            views.push(attachSelection(source, [cursor, unit.range[1]], selectionRange, index))
        }
    } else {
        views = children
    }

    return views
}  

const ast2ReactElements = (source: string, ast: Abstract[], selectionRange, keyPrefix="") => {
    return ast.map((unit, index) => astUnit2ReactElement(source, unit, `${keyPrefix}.${index}`, selectionRange))
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
        const shadowEditor = this.refs['se'] as any 
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
                    cursor.style.top = shadowEditor.scrollTop + rect.top + LINE_HEIGHT + 'px'
                } else {
                    cursor.style.left = rect.left + 'px'
                    cursor.style.top = shadowEditor.scrollTop + rect.top + 'px'
                }
            }
        }
    }

    render () {

        let views = ast2ReactElements(
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
                ref="se"
                >
                    {views}
                <span className="cursor" ref="cursor" dangerouslySetInnerHTML={{__html: Cursor}}>
                </span>
            </div>
        )
    }
}

export default ShadowEditor