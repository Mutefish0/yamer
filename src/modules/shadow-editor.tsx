import React from 'react'
import { MAST, Block, Inline, Heading, ListItem, Blockquote, Paragraph } from 'libs/markdown'
import hljs from 'highlight.js'

interface Point {
    offset: number
    line: number
    column: number
}

interface Location {
    start: Point
    end: Point
}

const extractSource = (source: string, p: Location) => {
    return source.slice(p.start.offset, p.end.offset)
}

const inline2ReactElement = (source, inline: Inline, index) => {
    switch (inline.type) {
        case 'hard_break':
        case 'image':
        case 'link':
        case 'text':
            return (
                <span className={inline.type} key={index}>
                    {extractSource(source, inline.location)}
                </span>
            )
        case 'code':
            return (
                <code className={inline.type} key={index}>
                    {extractSource(source, inline.location)}
                </code>
            )
        case 'strong_emphasis':
            return (
                <strong className={inline.type} key={index}>
                    <em>
                        {extractSource(source, inline.location)}
                    </em>
                </strong>
            )
        case 'strong':
            return (
                <strong className={inline.type} key={index}>
                    {extractSource(source, inline.location)}
                </strong>
            )
        case 'emphasis':
            return (
                <em className={inline.type} key={index}>
                    {extractSource(source, inline.location)}
                </em>
            )
        case 'strikethrough':
            return (
                <del className={inline.type} key={index}>
                    {extractSource(source, inline.location)}
                </del>
            )
    }
}

const prefixElement = (source, block) => {
    let start = block.children[0].location.start.offset 
    let _start = block.location.start.offset
    return (
        <span className={`${block.type}-prefix`} key='prefix'>
            {source.slice(_start, start)}
        </span>
    )
}

const suffixElement = (source, block) => {
    if (block.type == 'code_block') {
        console.log('cb')
        window.cb = block
    }

    let end = block.children[block.children.length - 1].location.end.offset
    let _end = block.location.end.offset
    return (
        <span className={`${block.type}-suffix`} key='suffix'>
            {source.slice(end, _end)}
        </span>
    )
}

const block2ReactElement = (source, block: Block, index) => {
    switch (block.type) {
        case 'blockquote':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block)}
                    {block.children.map(block2ReactElement.bind({}, source)) }
                    {suffixElement(source, block)}
                </span>
            )
        case 'paragraph':
        case 'heading':
        case 'list_item':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block)}
                    {block.children.map(inline2ReactElement.bind({}, source))}
                    {suffixElement(source, block)}
                </span>
            )
        case 'thematic_break':
            return React.createElement('span', { key: index }, extractSource(source, block.location))
        case 'code_block':
            let highlight = hljs.highlight(block.language, block.children[0].content, true)
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block)}
                    <code 
                        key={0} className="hljs" 
                        lang={highlight.language}
                        dangerouslySetInnerHTML={{__html: highlight.value}}
                    ></code>
                    {suffixElement(source, block)}
                </span>
            )
        case 'list':
            return (
                <span key={index} className={block.type}>
                    {block.children.map(block2ReactElement.bind({}, source))}
                </span>
            )
        case 'link_reference_definition':
            return (
                <span key={index} className={block.type}>
                    {extractSource(source, block.location)}
                </span>
            )
        case 'blank_lines':
            return (
                <span key={index} className={block.type}>
                    {extractSource(source, block.location)}
                </span>
            )
        default:
            return undefined
    }  
}

const ast2ReactElement = (source: string, ast: Block[]) => {
    return ast.map(block2ReactElement.bind({}, source))
}


class ShadowEditor extends React.Component<{ ast: MAST }> {
    render () {
        let view = ast2ReactElement(this.props.ast.source, this.props.ast.entities)
        return (
            <div className="shadow-editor" contentEditable={false}>
                <pre>
                {view}
                </pre>
            </div>
        )
    }
}

export default ShadowEditor