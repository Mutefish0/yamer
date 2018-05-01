import React from 'react'
import { MAST, Block, Inline } from 'libs/markdown'
import hljs from 'highlight.js'
import classNames from 'classnames'

const inline2ReactElement = (inline: Inline, index) => {
    switch (inline.type) {
        case 'hard_break':
            return <br key={index} />
        case 'code':
            return <code key={index}>{inline.content}</code>
        case 'keyboard':
            return <kbd key={index}>{inline.content}</kbd>
        case 'image':
            return (
                <img key={index} src={inline.url} alt={inline.title} title={inline.title} />
            )
        case 'link':
            return (
                <a href={inline.url} title={inline.title} key={index}>
                    {inline.children.map(inline2ReactElement)}
                </a>
            )
        case 'strong_emphasis':
            return <strong key={index}><em>{inline.content}</em></strong>
        case 'strong':
            return <strong key={index}>{inline.content}</strong>
        case 'emphasis':
            return <em key={index}>{inline.content}</em>
        case 'strikethrough':
            return <del key={index}>{inline.content}</del>
        case 'text':
            return inline.content
    }
}

const block2ReactElement = function (block: Block, index) {
    switch (block.type) {
        case 'blockquote':
            return React.createElement('blockquote', { key: index }, block.children.map(block2ReactElement.bind(this)))
        case 'blockquote_unit':
            return block.children.map(block2ReactElement.bind(this))
        case 'paragraph':
            return React.createElement('p', { key: index }, block.children.map(inline2ReactElement))
        case 'heading':
            return React.createElement(`h${block.level}`, { key: index }, block.children.map(inline2ReactElement))
        case 'thematic_break':
            return React.createElement('hr', { key: index })
        case 'code_block':
            let highlight = hljs.highlight(block.language, block.content, true)
            let code = React.createElement('code',
                {
                    className: 'hljs',
                    lang: highlight.language,
                    key: index,
                    dangerouslySetInnerHTML: { __html: highlight.value }
                }
            )
            return React.createElement('pre', { key: index }, code)
        case 'list_item':
            return React.createElement('li', { key: index }, block.children.map(inline2ReactElement))
        case 'list_task_item':
            return (
                <li key={index} className="task">
                    <i
                        key="-1"
                        className={classNames(['checkbox', { 'checked': block.checked }])}
                        onClick={() => this.props.onReact({ type: 'click_checkbox', node: block })}
                    />
                    {block.children.map(inline2ReactElement)}
                </li>
            )
        case 'list':
            return React.createElement('ul', { key: index }, block.children.map(block2ReactElement.bind(this)))
        case 'link_reference_definition':
        case 'blank_lines':
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
            <div className="reader" onClick={this.dealClick.bind(this)}>
                {view}
            </div>
        )
    }
}

export default Reader