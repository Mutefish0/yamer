import React from 'react'
import { MarkdownAST, Block, Inline } from 'libs/markdown'

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
            return React.createElement('a', {
                href: inline.url,
                title: inline.title,

                key: index
            }, inline.name)
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

const block2ReactElement = (block: Block, index) => {
    switch (block.type) {
        case 'blockquote':
            return React.createElement('blockquote', { key: index }, block.children.map(block2ReactElement))
        case 'paragraph':
            return React.createElement('p', { key: index }, block.children.map(inlien2ReactElement))
        case 'heading':
            return React.createElement(`h${block.level}`, { key: index }, block.children.map(inlien2ReactElement))
        case 'thematic_break':
            return React.createElement('hr', { key: index }) 
        case 'code_block':
            let code = React.createElement('code', { lang: block.language, key: index }, block.content)
            return React.createElement('pre', { key: index }, code) 
        case 'list_item':
            return React.createElement('li', { key: index }, block.children.map(inlien2ReactElement))
        case 'list':
            return React.createElement('ul', { key: index }, block.children.map(block2ReactElement))
        case 'link_reference_definition':
        case 'blank_lines':
        default: 
            return undefined
    }   
}

const ast2ReactElement = (ast: MarkdownAST) => {
    return ast.map(block2ReactElement)
}

interface MarkdownMinimapProps {
    ast: MarkdownAST
}

const MarkdownMinimap = ({ ast }: MarkdownMinimapProps) => {
    let t = ast2ReactElement(ast) 
    return (
        <div className="minimap" contentEditable={false}>
            {t}
        </div>
    )
}

export default MarkdownMinimap