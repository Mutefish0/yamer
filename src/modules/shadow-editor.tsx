import React from 'react'
import { MarkdownAST, Block, Inline, Heading, ListItem, Blockquote } from 'libs/markdown'
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

const resolveBlockWithChildren = (source, block: Heading | ListItem, index) => {
    let children = []
    let start = block.children[0].location.start.offset
    let end = block.children[block.children.length - 1].location.end.offset

    children.push(source.slice(block.location.start.offset, start))
    children.push(block.children.map(inlien2ReactElement.bind({}, source)))
    children.push(source.slice(end, block.location.end.offset))

    return React.createElement('span', { key: index, className: block.type }, children)
} 

const inlien2ReactElement = (source, inline: Inline, index) => {
    return React.createElement('span', { className: inline.type, key: index }, extractSource(source, inline.location))
}

const block2ReactElement = (source, block: Block, index) => {
    switch (block.type) {
        case 'blockquote':
            let blockquoteChildren = []
            let bqStart = block.children[0].location.start.offset
            let bqEnd = block.children[block.children.length - 1].location.end.offset

            blockquoteChildren.push(source.slice(block.location.start, bqStart))
            blockquoteChildren.push(block.children.map(block2ReactElement.bind({}, source)))
            blockquoteChildren.push(source.slice(bqEnd, block.location.end.offset))

            return React.createElement('span', { key: index, className: block.type }, blockquoteChildren)
        case 'paragraph':
            return React.createElement('span', { key: index }, block.children.map(inlien2ReactElement.bind({}, source)))
        case 'heading':
        case 'list_item':
            return resolveBlockWithChildren(source, block, index)
        case 'thematic_break':
            return React.createElement('span', { key: index }, extractSource(source, block.location))
        case 'code_block':
            let codeBlockChildren = []
            let codeStart = block.code.location.start.offset
            let codeEnd = block.code.location.end.offset

            codeBlockChildren.push(source.slice(block.location.start, codeStart))

            let highlight = hljs.highlight(block.language, block.code.content, true)
            let code = React.createElement('code',
                {
                    className: 'hljs',
                    lang: highlight.language,
                    key: index,
                    dangerouslySetInnerHTML: { __html: highlight.value }
                }
            )

            codeBlockChildren.push(code)
            codeBlockChildren.push(source.slice(codeEnd, block.location.end.offset))
            
            return React.createElement('span', { key: index, className: block.type }, codeBlockChildren)
        case 'list':
            return React.createElement('span', { key: index, className: block.type }, block.children.map(block2ReactElement.bind({}, source)))
        case 'link_reference_definition':
            return React.createElement('span', { key: index }, extractSource(source, block.location))
        case 'blank_lines':
            return React.createElement('span', { key: index }, extractSource(source, block.location))
        default:
            return undefined
    }  
}

const ast2ReactElement = (source: string, ast: Block[]) => {
    return ast.map(block2ReactElement.bind({}, source))
}


class ShadowEditor extends React.Component<{ ast: MarkdownAST }> {
    render () {
        let view = ast2ReactElement(this.props.ast.source, this.props.ast.ast)
        return (
            <pre>
                <div className="shadow-editor" contentEditable={false}>
                    {view}
                </div>
            </pre>
        )
    }
}

export default ShadowEditor