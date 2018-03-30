import React from 'react'
import { MAST, Block, Inline } from 'libs/markdown'
import hljs from 'highlight.js'
import classNames from 'classnames'

/**
 * @TODO 用JSX来改造，更直观
 */

const inlien2ReactElement = (inline: Inline, index) => {
    switch (inline.type) {
        case 'hard_break':
            return React.createElement('br', { key: index })
        case 'code':
            return React.createElement('code', { key: index }, inline.content)
        case 'image':
            return React.createElement('img', { 
                src: inline.url,   
                title: inline.title,

                key: index
            })
        case 'link':
            return (
                <a href={inline.url} title={inline.title} key={index}>
                    {inline.children.map(inlien2ReactElement) }
                </a>
            )
        case 'strong_emphasis':
            let em = React.createElement('em', { key: index }, inline.content)
            return React.createElement('strong', { key: index }, em)
        case 'strong':
            return React.createElement('strong', { key: index }, inline.content)
        case 'emphasis':
            return React.createElement('em', { key: index }, inline.content)
        case 'strikethrough':
            return React.createElement('del', { key: index }, inline.content)
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
            return React.createElement('p', { key: index }, block.children.map(inlien2ReactElement))
        case 'heading':
            return React.createElement(`h${block.level}`, { key: index }, block.children.map(inlien2ReactElement))
        case 'thematic_break':
            return React.createElement('hr', { key: index }) 
        case 'code_block':
            let highlight = hljs.highlight(block.language, block.children[0].content, true)
            let code = React.createElement('code', 
            { 
                className: 'hljs', 
                lang: highlight.language, 
                key: index, 
                dangerouslySetInnerHTML: { __html: highlight.value}}
            )
            return React.createElement('pre', { key: index }, code) 
        case 'list_item':
            return React.createElement('li', { key: index }, block.children.map(inlien2ReactElement))
        case 'list_task_item':
            return (
                <li key={index} className="task">
                    <i 
                        key="-1"
                        className={classNames(['checkbox', {'checked': block.checked}]) }
                        onClick={() => this.props.onReact({ type: 'click_checkbox', node: block })}
                    />
                    {block.children.map(inlien2ReactElement)}
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
    ast: MAST,
    onReact: Function
}

class MarkdownMinimap extends React.Component<Props> {
    render () {
        let view = ast2ReactElement.bind(this)(this.props.ast.entities)
        return (
            <div className="minimap" contentEditable={false}>
                {view}
            </div>
        )
    }
}

export default MarkdownMinimap