type InlineElement = 
    'hard_break' 
    | 'code'
    | 'image' 
    | 'link' 
    | 'strong_emphasis' 
    | 'strong' 
    | 'emphasis' 
    | 'strikethrough' 
    | 'text'

interface Inline {
    type: InlineElement,
    content?: string,

    name?: string,
    url?: string,
    title?: string
}

interface Blockquote {
    type: 'blockquote',
    children: LeafBlock[]
}

type LeafBlock = 
    Paragraph 
    | Heading 
    | ThematicBreak 
    | CodeBlock
    | LinkReferenceDefinition
    | BlankLines

interface Paragraph {
    type: 'paragraph',
    children: Inline[]
}

interface Heading {
    type: 'heading',
    level: number,
    children: Inline[]
}

interface ThematicBreak {
    type: 'thematic_break'
}

interface CodeBlock {
    type: 'code_block',
    content: string,
    language: string
}

interface LinkReferenceDefinition {
    type: 'link_reference_definition',
    name: string,
    url: string,
    title?: string
}

interface BlankLines {
    type: 'blank_lines'
}

type Block = Blockquote | LeafBlock

export type MarkdownAST = Block[]

export function parse (source: string): MarkdownAST