import React from 'react'
import { MAST, Block, Inline } from 'libs/markdown'
import hljs from 'highlight.js'
import classNames from 'classnames'

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
            return React.createElement('blockquote', { key: key }, block.children.map(block2ReactElement.bind(this)))
        case 'blockquote_unit':
            return block.children.map(block2ReactElement.bind(this))
        case 'paragraph':
            return React.createElement('p', { key: key }, block.children.map(inline2ReactElement))
        case 'heading':
            return React.createElement(`h${block.level}`, { key: key }, block.children.map(inline2ReactElement))
        case 'thematic_break':
            return React.createElement('hr', { key: key })
        case 'code_block':
            let highlight = hljs.highlight(block.language, block.content, true)
            let code = React.createElement('code',
                {
                    className: 'hljs',
                    lang: highlight.language,
                    key: key,
                    dangerouslySetInnerHTML: { __html: highlight.value }
                }
            )
            return React.createElement('pre', { key: key }, code)
        case 'list_item':
            return React.createElement('li', { key: key }, block.children.map(inline2ReactElement))
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
            return React.createElement('ul', { key: key }, block.children.map(block2ReactElement.bind(this)))
        case 'link_reference_definition':
        case 'blank_line':
        default:
            return undefined
    }
}

const ast2ReactElement = function (ast: Block[]) {
    return ast.map(block2ReactElement.bind(this))
}


interface Props {
    ast?: MAST,
    onReact?: Function,
    onSchemaRequest?: Function
}

class Reader extends React.Component<Props> {
    static defaultProps = {
        ast: [],
        onReact: function () {},
        onSchemaRequest: function () {}
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

    render () {
        let view = ast2ReactElement.bind(this)(this.props.ast)
        return (
            <article className="Reader" onClick={this.dealClick.bind(this)}>
                {view}
            </article>
        )
    }
}

export default Reader