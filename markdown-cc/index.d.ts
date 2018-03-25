interface Point {
    offset: number
    line: number
    column: number
}

interface Location {
    start: Point
    end: Point
}

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
    type: InlineElement
    content?: string

    name?: string
    url?: string
    title?: string

    location: Location
}

interface Text {
    type: 'text'
    content?: string
    location: Location
}

interface BlockquoteUnit {
    type: 'blockquote_unit'
    children: LeafBlock[]
    location: Location
}

interface Blockquote {
    type: 'blockquote'
    children: BlockquoteUnit[]
    location: Location
}

type LeafBlock = 
    Paragraph 
    | Heading 
    | ThematicBreak 
    | CodeBlock
    | LinkReferenceDefinition
    | BlankLines
    | List 
    | ListItem

interface Paragraph {
    type: 'paragraph'
    children: Inline[]
    location: Location
}

interface Heading {
    type: 'heading'
    level: number
    children: Inline[]
    location: Location
}

interface ThematicBreak {
    type: 'thematic_break'
    location: Location
}

interface CodeBlock {
    type: 'code_block'
    children: Text[]
    language: string
    location: Location
}

interface Url {
    type: 'url',
    content: string
    location: Location
}

interface LinkReferenceDefinition {
    type: 'link_reference_definition'
    name: string
    url: string
    title?: string
    location: Location
    children: [Url]
}

interface BlankLines {
    type: 'blank_lines'
    location: Location
}

interface List {
    type: 'list',
    children: (ListItem | List)[]
    location: Location
}

interface ListItem {
    type: 'list_item'
    children: Inline[]
    location: Location
}

type ContainerBlock = Blockquote | BlockquoteUnit | CodeBlock

type Block = ContainerBlock | LeafBlock

export type MAST = { 
    entities: Block[]
    source: string
}

export function parse (source: string): MAST