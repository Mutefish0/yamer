import React from 'react'
import { MAST, Block, Inline } from 'libs/markdown'
import hljs from 'highlight.js'
import classNames from 'classnames'
import { Observable, Subscription } from 'rxjs'

const PADDING = 0

const inline2ReactElement = (inline: Inline) => {
    const key = JSON.stringify(inline.range)
    switch (inline.type) {
        case 'hard_break':
            return <br key={key} />
        case 'code':
            return <code key={key}>{inline.content}</code>
        case 'keyboard':
            return <kbd key={key}>{inline.content}</kbd>
        case 'image':
            return (
                <img key={key} src={inline.url} alt={inline.title} title={inline.title} />
            )
        case 'link':
            return (
                <a href={inline.url} title={inline.title} key={key}>
                    {inline.children.map(inline2ReactElement)}
                </a>
            )
        case 'strong_emphasis':
            return <strong key={key}><em>{inline.content}</em></strong>
        case 'strong':
            return <strong key={key}>{inline.content}</strong>
        case 'emphasis':
            return <em key={key}>{inline.content}</em>
        case 'strikethrough':
            return <del key={key}>{inline.content}</del>
        case 'text':
            return inline.content
    }
}

const block2ReactElement = function (block: Block) {
    const key = JSON.stringify(block.range)
    switch (block.type) {
        case 'blockquote':
            return React.createElement('blockquote', { key: key, 'data-range': key }, block.children.map(block2ReactElement.bind(this)))
        case 'blockquote_unit':
            return block.children.map(block2ReactElement.bind(this))
        case 'paragraph':
            return React.createElement('p', { key: key, 'data-range': key }, block.children.map(inline2ReactElement))
        case 'heading':
            return React.createElement(`h${block.level}`, { key: key, 'data-range': key }, block.children.map(inline2ReactElement))
        case 'thematic_break':
            return React.createElement('hr', { key: key, 'data-range': key })
        case 'code_block':
            let highlight = hljs.highlight(block.language, block.content, true)
            let code = React.createElement('code',
                {
                    className: 'hljs',
                    lang: highlight.language,
                    key: key,
                    'data-range': key,
                    dangerouslySetInnerHTML: { __html: highlight.value }
                }
            )
            return React.createElement('pre', { key: key, 'data-range': key }, code)
        case 'list_item':
            return React.createElement('li', { key: key, 'data-range': key }, block.children.map(inline2ReactElement))
        case 'list_task_item':
            return (
                <li key={key} className="task">
                    <i
                        key="-1"
                        className={classNames(['checkbox', { 'checked': block.checked }])}
                        onClick={() => this.props.onReact({ type: 'click_checkbox', node: block })}
                    />
                    {block.children.map(inline2ReactElement)}
                </li>
            )
        case 'list':
            return React.createElement('ul', { key: key, 'data-range': key }, block.children.map(block2ReactElement.bind(this)))
        case 'link_reference_definition':
        case 'blank_line':
        default:
            return undefined
    }
}

const ast2ReactElement = function (ast: Block[]) {
    return ast.map(block2ReactElement.bind(this))
}

// 视图顶部的Block块range，以及隐藏的比例0~1
export interface ScrollPosition {
    rangeWindow: [[number, number], [number, number]]
    vanishment: number  // 0~1
}

interface Props {
    overflowAuto?: boolean

    ast?: MAST,
    onReact?: Function,
    onSchemaRequest?: Function

    onScroll?: (scrollPosition: ScrollPosition) => any
    scrollSource?: Observable<ScrollPosition>
}

class Reader extends React.Component<Props> {
    private scrollSubscription?: Subscription

    static defaultProps = {
        overflowAuto: false,

        ast: [],
        onReact: function () {},
        onSchemaRequest: function () {},

        onScroll: null,
        scrollSource: null
    }

    componentDidMount () {
        // 处理滚动
        if (this.props.scrollSource) {
            this.scrollSubscription = this.props.scrollSource.subscribe(scrollPosiiton => this.scrollTo(scrollPosiiton))
        }
    }

    componentWillUnmount () {
        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe()
        }
    }

    dealClick (e) {
        const url = e.target['href']
        if (url) {
            const match =  url.match(/^yamer:\/\/(.+)/)
            if (match) {
                this.props.onSchemaRequest(`/${match[1]}`)
            }
        }
    }

    scrollTo (scrollPosition: ScrollPosition) {
        const reader = this.refs['reader'] as HTMLElement

        const startEl = scrollPosition.rangeWindow[0] ?
            reader.querySelector(`[data-range="${JSON.stringify(scrollPosition.rangeWindow[0])}"]`) as HTMLElement
            : null
        const endEl = scrollPosition.rangeWindow[1] ?
            reader.querySelector(`[data-range="${JSON.stringify(scrollPosition.rangeWindow[1])}"]`) as HTMLElement
            : null
        let offsetTopStart = startEl ? startEl.offsetTop : 0
        let offsetTopEnd
        if (endEl) {
            offsetTopEnd = endEl.offsetTop
        } else {
            const lastEl = reader.children[reader.children.length - 1] as HTMLElement
            offsetTopEnd = lastEl.offsetTop + lastEl.offsetHeight + 24 // 24 当做一个固定的margin         
        }

        reader.scrollTop  = scrollPosition.vanishment * (offsetTopEnd - offsetTopStart) + offsetTopStart
    }

    // 计算ScrollPosition
    dealScroll (e) {
        if (!this.props.onScroll) {
            return
        }

        const hostElement = e.currentTarget
        const ranges = this.props.ast.filter(b => b.type != 'blank_line').map(b => b.range)
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
                let rangeStart = ranges[mid - 1], rangeEnd = ranges[mid + 1]

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
        let view = ast2ReactElement.bind(this)(this.props.ast)
        return (
            <article className={classNames("Reader", {'scroll': this.props.overflowAuto})}
             ref="reader" onClick={this.dealClick.bind(this)}
             onScroll={this.dealScroll.bind(this)}
             >
                {view}
            </article>
        )
    }
}

export default Reader