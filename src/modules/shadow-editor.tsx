import React from 'react'
import { MAST, Block, Inline, Heading, ListItem, Blockquote, Paragraph } from 'libs/markdown'
import hljs from 'highlight.js'
import Caret from 'base/caret'

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

const inline2ReactElement = (captureCursorClick, source, inline: Inline, index) => {
    switch (inline.type) {
        case 'hard_break':
        case 'image':
        case 'link':
        case 'text':
            return (
                <span 
                    className={inline.type} key={index}
                    data-range={[inline.location.start.offset, inline.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, inline.location)}
                </span>
            )
        case 'code':
            return (
                <code 
                    className={inline.type} key={index}
                    data-range={[inline.location.start.offset, inline.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, inline.location)}
                </code>
            )
        case 'strong_emphasis':
            return (
                <strong 
                    className={inline.type} key={index}
                    data-range={[inline.location.start.offset, inline.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    <em>
                        {extractSource(source, inline.location)}
                    </em>
                </strong>
            )
        case 'strong':
            return (
                <strong 
                    className={inline.type} key={index}
                    data-range={[inline.location.start.offset, inline.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, inline.location)}
                </strong>
            )
        case 'emphasis':
            return (
                <em 
                    className={inline.type} key={index}
                    data-range={[inline.location.start.offset, inline.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, inline.location)}
                </em>
            )
        case 'strikethrough':
            return (
                <del 
                    className={inline.type} key={index}
                    data-range={[inline.location.start.offset, inline.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, inline.location)}
                </del>
            )
    }
}


const prefixElement = (source, block, captureCursorClick) => {
    let start = block.children[0].location.start.offset 
    let _start = block.location.start.offset
    return (
        <span 
            className={`${block.type}-prefix`} 
            key='prefix'
            onClick={captureCursorClick}
            data-range={[_start, start]}
        >
            {source.slice(_start, start)}
        </span>
    )
}

const suffixElement = (source, block, captureCursorClick) => {
    let end = block.children[block.children.length - 1].location.end.offset
    let _end = block.location.end.offset
    return (
        <span 
            className={`${block.type}-suffix`} 
            key='suffix' 
            onClick={captureCursorClick}
            data-range={[end, _end]}
        >
            {source.slice(end, _end)}
        </span>
    )
}

const block2ReactElement = (captureCursorClick, source, block: Block, index) => {
    switch (block.type) {
        case 'blockquote':
            return (
                <span key={index} className={block.type}>
                    {block.children.map(block2ReactElement.bind({}, captureCursorClick, source)) }
                </span>
            )
        case 'blockquote_unit':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block, captureCursorClick)}
                    {block.children.map(block2ReactElement.bind({}, captureCursorClick, source))}
                    {suffixElement(source, block, captureCursorClick)}
                </span>
            )
        case 'paragraph':
        case 'heading':
        case 'list_item':
            return (
                <span key={index} className={block.type}>
                    {prefixElement(source, block, captureCursorClick)}
                    {block.children.map(inline2ReactElement.bind({}, captureCursorClick, source))}
                    {suffixElement(source, block, captureCursorClick)}
                </span>
            )
        case 'thematic_break':
            return (
                <span
                    key={index} className={block.type}
                    data-range={[block.location.start.offset, block.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, block.location)}
                </span>
            )
        case 'code_block':
            let highlight = hljs.highlight(block.language, block.children[0].content, true)
            return (
                <span key={index} className={block.type} >
                    {prefixElement(source, block, captureCursorClick)}
                    <code 
                        key={0} className="hljs" 
                        lang={highlight.language}
                        dangerouslySetInnerHTML={{__html: highlight.value}}
                        data-range={[block.children[0].location.start.offset, block.children[0].location.end.offset]}
                        onClick={captureCursorClick}
                    ></code>
                    {suffixElement(source, block, captureCursorClick)}
                </span>
            )
        case 'list':
            return (
                <span key={index} className={block.type}>
                    {block.children.map(block2ReactElement.bind({}, captureCursorClick, source))}
                </span>
            )
        case 'link_reference_definition':
            return (
                <span 
                    key={index} className={block.type}
                    data-range={[block.location.start.offset, block.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, block.location)}
                </span>
            )
        case 'blank_lines':
            return (
                <div 
                    key={index} className={block.type}
                    data-range={[block.location.start.offset, block.location.end.offset]}
                    onClick={captureCursorClick}
                >
                    {extractSource(source, block.location)}
                </div>
            )
        default:
            return undefined
    }  
}

const ast2ReactElement = (source: string, ast: Block[], captureCursorClick) => {
    return ast.map(block2ReactElement.bind({}, captureCursorClick, source))
}


class ShadowEditor extends React.Component<{ ast: MAST, onCursorChange: Function }> {
    captureCursorClick (e) {
        let range = Caret.getRange()
        let baseOffset = parseInt(e.currentTarget.getAttribute('data-range').split(',')[0])
        let cursorRange = [baseOffset + range.startOffset, baseOffset + range.endOffset]
        
        this.props.onCursorChange(cursorRange)
        e.stopPropagation()
        e.preventDefault()
    }

    render () {
        let view = ast2ReactElement(this.props.ast.source, this.props.ast.entities, this.captureCursorClick.bind(this))
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