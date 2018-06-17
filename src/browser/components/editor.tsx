import React from 'react'
import MarkdownParser from 'libs/markdown.js'
import Caret from 'browser/util/caret'
import { CharCode } from 'browser/util/char-code'
import { Subject, Observable, Subscription } from 'rxjs/Rx'
import { MAST, Abstract } from 'libs/markdown'
import classNames from 'classnames'
import Cursor from './Cursor'


const LINE_HEIGHT = 14 * 1.4
const PADDING = 14

export interface Reaction {
    type: string
    node: Abstract
}

// 视图顶部的Block块range，以及隐藏的比例0~1
export interface ScrollPosition {
    rangeWindow: [[number, number], [number, number]]
    vanishment: number  // 0~1
}

interface Props {
    placeholder?: string
    defaultValue?: string

    onChange?: Function

    reactionSource?: Subject<Reaction>

    onScroll?: (scrollPosition: ScrollPosition) => any
    scrollSource?: Observable<ScrollPosition>
}

type Selection = [number, number]

interface State {
    isFocused: boolean
    isNapping: boolean

    ast: MAST
    selection: Selection
}

const slice = String.prototype.slice

const attachSelection = (source, range, selectionRange) => {
    const collapsed = selectionRange[0] == selectionRange[1]
    const leftJoin = Math.max(range[0], selectionRange[0])
    const rightJoin = Math.min(range[1], selectionRange[1])
    const props = { key: range[0], 'data-range':  JSON.stringify(range)}
    if (collapsed) {
        if (selectionRange[0] >= range[0] && selectionRange[0] <= range[1]) {
            props['data-cursor-offset'] = selectionRange[0] - range[0]
        }
        return <span {...props}>{slice.apply(source, range)}</span>
    } else if (leftJoin < rightJoin) {
        const ranges = [[range[0], leftJoin], [leftJoin, rightJoin], [rightJoin, range[1]]]
        const classNames = ['', 'selected', '']
        return [0, 1, 2].map(i => {
            const className = classNames[i], range = ranges[i]
            return range[0] < range[1] && (
                <span key={range[0]} className={className} data-range={JSON.stringify(range)}>
                    {slice.apply(source, range)}
                </span>
            )
        })
    } else {
        return slice.apply(source, range)
    }
}

const astUnit2ReactElement = (source, unit: Abstract, selectionRange) => {
    let children: any = unit.children
        ? ast2ReactElements(source, unit.children, selectionRange)
        : attachSelection(source, unit.range, selectionRange)
    let views = []
    if (unit.ranges) {
        let cursor = unit.range[0]
        for (let key in unit.ranges) {
            var range = unit.ranges[key]
            if (cursor < range[0]) {
                views.push(
                    <span key={cursor} data-range={JSON.stringify([cursor, range[0]])}>
                        {attachSelection(source, [cursor, range[0]], selectionRange)}
                    </span>
                )
                cursor = range[0]
            }
            if (range[0] < range[1]) {
                if (key == 'children') {
                    views = views.concat(children)
                } else {
                    const splitKey = key.split('children#')
                    if (splitKey[0] == '') {
                        views.push(
                            <span key={cursor} data-range={JSON.stringify(range)} className={splitKey[1]}>
                                {children}
                            </span>
                        )
                    } else {
                        views.push(
                            <span key={cursor} data-range={JSON.stringify(range)} className={splitKey[0]}>
                                {attachSelection(source, range, selectionRange)}
                            </span>
                        )
                    }
                }
                cursor = range[1]
            }
        }
        if (cursor < unit.range[1]) {
            views.push(attachSelection(source, [cursor, unit.range[1]], selectionRange))
        }
    } else {
        views = children
    }
    return (
        <span key={unit.range[0]} data-range={JSON.stringify(unit.range)} className={unit.type}>{views}</span>
    )
}

const ast2ReactElements = (source: string, ast: Abstract[], selectionRange) => {
    return ast.map((unit, index) => astUnit2ReactElement(source, unit, selectionRange))
}

class Editor extends React.Component<Props, State> {
    private previousRevisionedSelection: Selection 
    private source: string
    private cursorNappingTimeout
    private clientTop: number
    private clientLeft: number 
    private cursorChangeSubscription: Subscription
    private reactionSubscription: Subscription

    private scrollSubscription?: Subscription

    constructor (props) {
        super(props)
        this.state = {
            isFocused: false,
            isNapping: true,
            ast: [],
            selection: [0, 0]
        }
        this.cursorNappingTimeout = null 
    }

    componentDidMount () {
        /* --- source --- */
        let prevRange = [0, 0]
        const sourceElement = this.refs['source'] as HTMLTextAreaElement
        const inputSource = Observable.fromEvent(sourceElement, 'input')
        //const deletionAndReturnSource = Observable.fromEvent(sourceElement, 'keyup').filter(e => R.contains(e['keyCode'], [CharCode.CarriageReturn, CharCode.BackSpace]))
        const documentCursorChangeSource = Observable.merge(inputSource, Observable.fromEvent(document, 'selectionchange'))
        const cursorChangeSource = documentCursorChangeSource.map(e => {
            const refEditor = this.refs['source'] as any
            return [refEditor.selectionStart, refEditor.selectionEnd] as Selection
        })
        const diffSource = cursorChangeSource.filter(range => {
            if (range[0] != prevRange[0] || range[1] != prevRange[1]) {
                prevRange = range
                return true
            } else {
                return false
            }
        })

        this.cursorChangeSubscription = diffSource.subscribe(range => {
            this.setState({ isNapping: false, selection: range })
            
            clearTimeout(this.cursorNappingTimeout)
            setTimeout(() => this.setState({ isNapping: true }), 800)

            this.checkCursorInView()
        })

        // 设置默认source
        if (this.props.defaultValue) {
            this.setSource(this.props.defaultValue)
        }

        // 处理reaction
        this.reactionSubscription = this.props.reactionSource.subscribe((action: Reaction) => {
            switch (action.type) {
                case 'click_checkbox':
                    const node = action.node
                    const isChecked = node.checked
                    const range = node.ranges['check']
                    const newSource = `${this.source.slice(0, range[0])}${isChecked ? ' ' : 'x'}${this.source.slice(range[1])}`
                    this.setSource(newSource)
                default:
            }
        })

        // 记录编辑器的绝对位置，方便设置光标的位置
        const shadowEditor = this.refs['shadow'] as HTMLDivElement
        const rect = shadowEditor.getBoundingClientRect()
        this.clientTop = rect.top
        this.clientLeft = rect.left 

        // 处理滚动
        if (this.props.scrollSource) {
            this.scrollSubscription = this.props.scrollSource.subscribe(scrollPosiiton => this.scrollTo(scrollPosiiton))
        }

    }

    componentWillUnmount () {
        this.cursorChangeSubscription.unsubscribe()
        this.reactionSubscription.unsubscribe()

        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe()
        }
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.defaultValue != this.props.defaultValue) {
            this.setSource(nextProps.defaultValue)
        }
    }

    static defaultProps = {
        placeholder: '',
        defaultValue: '',
        onChange: function () {},
        onSelectionChange: function () {},
        reactionSource: new Subject(),

        onScroll: null,
        scrollSource: null
    }

    dealSourceChange () {
        const sourceElement = this.refs['source'] as HTMLTextAreaElement
        this.source = sourceElement.value 
        const ast = MarkdownParser.parse(this.source)
        this.setState({ ast })
        this.props.onChange({ source: this.source, ast })
    }

    dealKeydown (e) {
        if (e.keyCode == CharCode.Tab) {
            const cursorOffset = e.target.selectionStart
            const newSource = `${this.source.slice(0, cursorOffset)}  ${this.source.slice(cursorOffset)}`
            this.setSource(newSource)
            this.setSelection([cursorOffset + 2, cursorOffset + 2])
            e.preventDefault()
        }
    }

    // 从影子编辑器点击(或选中)，选取后设置源编辑器的光标
    dealSelectionRevision (e) {
        const range = Caret.getRange()
        const startContainer = range.startContainer.parentElement
        const endContainer = range.endContainer.parentElement

        const sRang =  JSON.parse(startContainer.getAttribute('data-range'))
        const eRange = JSON.parse(endContainer.getAttribute('data-range'))

        if (sRang && eRange) {
            const baseStartOffset = sRang[0]
            const baseEndOffset = eRange[0]

            let cursorRange: Selection = [baseStartOffset + range.startOffset, baseEndOffset + range.endOffset]
            const prevRange = this.previousRevisionedSelection

            //shift点击选中适配
            if (e.shiftKey) {
                cursorRange = [Math.min(cursorRange[0], prevRange[0]), Math.max(cursorRange[1], prevRange[1])]
            }

            this.setSelection(cursorRange)

            this.previousRevisionedSelection = cursorRange
        } else {
            this.setSelection(this.state.selection)
        }

        e.stopPropagation()
        e.preventDefault()
    }

    setSelection (range: Selection) {
        const sourceElement = this.refs['source'] as HTMLTextAreaElement
        sourceElement.setSelectionRange(range[0], range[1])
        sourceElement.focus()
    }

    setSource (source: string) {
        const sourceElement = this.refs['source'] as HTMLTextAreaElement
        this.source = source
        sourceElement.value = source
        this.dealSourceChange()
    }

    // 渲染闭合光标
    componentDidUpdate () {
        // 如果光标未闭合，无需操作
        if (this.state.selection[0] != this.state.selection[1]) {
            return 
        } 

        const cursorHost = document.querySelector('.Editor [data-cursor-offset]') as HTMLSpanElement
        const cursor = this.refs['cursor'] as HTMLSpanElement
        const shadowEditor = this.refs['shadow'] as HTMLDivElement
        
        if (cursorHost) {
            const textHost = cursorHost.childNodes[0]
            if (textHost) {
                const baseOffset =  JSON.parse(cursorHost.getAttribute('data-range'))[0]
                const offset = parseInt(cursorHost.getAttribute('data-cursor-offset'))
                const prevCharOffset = parseInt(baseOffset) + offset;
                const range = document.createRange()

                const prevChar = this.source.slice(prevCharOffset - 1, prevCharOffset)
                // 如果前一个字符为'\n'则换行
                if (prevChar == '\n') {
                    let rect
                    let length
                    // 仅包换多个换行符的元素，通过部分的range获取ClientRect不可预测
                    if (/^\n+$/.test(textHost.textContent)) {
                        range.selectNodeContents(textHost)
                        length = offset
                    } else {
                        range.setStart(textHost, offset)
                        range.setEnd(textHost, offset)
                        length = 1 
                    }
                    rect = range.getBoundingClientRect()
                    cursor.style.left = PADDING + 'px'
                    cursor.style.top = -this.clientTop + shadowEditor.scrollTop + rect.top + length * LINE_HEIGHT + 'px'
                } else {
                    range.setStart(textHost, offset)
                    range.setEnd(textHost, offset)
                    const rect = range.getBoundingClientRect()

                    cursor.style.left = - this.clientLeft + rect.left + 'px'
                    cursor.style.top = -this.clientTop + shadowEditor.scrollTop + rect.top + 'px'
                }
                
            }
        }
    }

    // 检查光标是否快要脱离视野，若满足条件，则自动滚动
    checkCursorInView () {
        const shadowEditor = this.refs['shadow'] as HTMLDivElement
        const cursor = this.refs['cursor'] as HTMLSpanElement

        if (parseInt(cursor.style.top) > shadowEditor.offsetHeight + shadowEditor.scrollTop - 40) {
            this.scrollDown()
        } else if (parseInt(cursor.style.top) < shadowEditor.scrollTop + 40) {
            this.scrollUp()
        }
    }


    scrollUp () {
        const shadowEditor = this.refs['shadow'] as HTMLDivElement
        shadowEditor.scrollTop = shadowEditor.scrollTop - 100
    }

    scrollDown () {
        const shadowEditor = this.refs['shadow'] as HTMLDivElement
        shadowEditor.scrollTop = shadowEditor.scrollTop + 100
    }

    scrollTo (scrollPosition: ScrollPosition) {
        const shadowEditor = this.refs['shadow'] as HTMLElement
        
        const startEl = scrollPosition.rangeWindow[0] ?
            shadowEditor.querySelector(`[data-range="${JSON.stringify(scrollPosition.rangeWindow[0])}"]`) as HTMLElement
            : null
        const endEl = scrollPosition.rangeWindow[1] ? 
            shadowEditor.querySelector(`[data-range="${JSON.stringify(scrollPosition.rangeWindow[1])}"]`) as HTMLElement
            : null
        let offsetTopStart = startEl ? startEl.offsetTop : 0
        let offsetTopEnd
        if (endEl) {
            offsetTopEnd = endEl.offsetTop
        } else {
             const lastEl = shadowEditor.children[shadowEditor.children.length - 1] as HTMLElement
             offsetTopEnd = lastEl.offsetTop + lastEl.offsetHeight + 24 // 24 当做一个固定的margin         
        }

        shadowEditor.scrollTop = scrollPosition.vanishment * (offsetTopEnd - offsetTopStart) + offsetTopStart
    }

    // 计算ScrollPosition
    dealScroll (e) {
        if (!this.props.onScroll) {
            return
        }

        const hostElement = e.currentTarget 
        const ranges = this.state.ast.map(b => b.range)
        const types = this.state.ast.map(b => b.type)
        // 二分法
        let start = 0, end = ranges.length - 1
        while (start <= end) {
            let mid = Math.floor((start + end) / 2)
            let el = hostElement.querySelector(`[data-range="${JSON.stringify(ranges[mid])}"]`)
            if (el.offsetTop - PADDING > hostElement.scrollTop) {
                end = mid - 1
            } else if (el.offsetTop - PADDING + el.offsetHeight <= hostElement.scrollTop) {
                start = mid + 1
            } else {
                let rangeStart, indexStart = mid - 1
                let rangeEnd, indexEnd = mid + 1

                while (indexStart > -1) {
                    if (types[indexStart] !== 'blank_line') {
                        rangeStart = ranges[indexStart]
                        break
                    }
                    indexStart--
                }
                
                while (indexEnd < ranges.length) {
                    if (types[indexEnd] !== 'blank_line') {
                        rangeEnd = ranges[indexEnd]
                        break
                    }
                    indexEnd++
                }

                let offsetTopStart, offsetTopEnd
                
                if (rangeStart) {
                    offsetTopStart = hostElement.querySelector(`[data-range="${JSON.stringify(rangeStart)}"]`).offsetTop
                } else {
                    offsetTopStart = 0
                }

                if (rangeEnd) {
                    offsetTopEnd = hostElement.querySelector(`[data-range="${JSON.stringify(rangeEnd)}"]`).offsetTop
                } else {
                    const endEl = hostElement.children[hostElement.children.length - 1]
                    offsetTopEnd = endEl.offsetTop + endEl.offsetHeight + 24 // 24 当做一个固定的margin
                }

                let vanishment = (hostElement.scrollTop - offsetTopStart) / (offsetTopEnd - offsetTopStart) 
                this.props.onScroll({ 
                    rangeWindow: [rangeStart, rangeEnd], 
                    vanishment
                })
                return
            }
        }
    }

    render () {
        const shadowViews = ast2ReactElements(this.source, this.state.ast, this.state.selection)
        const showCursor = this.state.selection[0] == this.state.selection[1]
        return (
            <div className="Editor">
                <textarea
                    className="source"
                    ref="source"
                    onInput={this.dealSourceChange.bind(this)}
                    onKeyDown={this.dealKeydown.bind(this)}
                    onFocus={() => this.setState({ isFocused: true })}
                    onBlur={() => this.setState({ isFocused: false })}
                    defaultValue={this.props.defaultValue}
                >
                </textarea>
                <div
                    onClick={this.dealSelectionRevision.bind(this)}
                    className={classNames([
                        'shadow',
                        { 'napping': this.state.isNapping },
                        { 'focused': this.state.isFocused }
                    ])}
                    ref="shadow"
                    onScroll={this.dealScroll.bind(this)}
                >
                    {shadowViews}
                    <span>{'\u001A'}</span>
                    <span className={classNames('cursor', { 'show': showCursor}) } ref="cursor" dangerouslySetInnerHTML={{ __html: Cursor }}>
                    </span>
                </div>
            </div>
        )   
    }
}

export default Editor
