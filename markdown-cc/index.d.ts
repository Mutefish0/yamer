interface Point {
    offset: number
    line: number
    column: number
}

type IRange = [number, number]

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
    | 'keyboard'

interface Abstract {
    type: string
    
    content?: string

    name?: string
    url?: string
    title?: string

    checked: boolean

    range: IRange

    ranges?: IRange[]

    children?: (Inline|Block)[]
}

interface Inline {
    type: InlineElement
    content?: string

    name?: string
    url?: string
    title?: string

    range: IRange

    ranges?: IRange[]

    children?: Inline[]
}

interface Text {
    type: 'text'
    content?: string
    range: IRange
}

interface BlockquoteUnit {
    type: 'blockquote_unit'
    children: LeafBlock[]
    range: IRange
    ranges?: IRange[]
}

interface Blockquote {
    type: 'blockquote'
    children: BlockquoteUnit[]
    range: IRange
    ranges?: IRange[]
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
    | ListTaskItem

interface Paragraph {
    type: 'paragraph'
    children: Inline[]
    range: IRange
}

interface Heading {
    type: 'heading'
    level: number
    children: Inline[]
    range: IRange
    ranges: IRange[]
}

interface ThematicBreak {
    type: 'thematic_break'
    range: IRange
}

interface CodeBlock {
    type: 'code_block'
    content: string
    language: string
    range: IRange
    ranges: IRange[]
}


interface LinkReferenceDefinition {
    type: 'link_reference_definition'
    name: string
    url: string
    title?: string
    range: IRange
    ranges: IRange[]
    children: [Text]
}

interface BlankLines {
    type: 'blank_lines'
    range: IRange
}

interface List {
    type: 'list',
    children: (ListItem | List)[]
    range: IRange
}

interface ListItem {
    type: 'list_item'
    children: Inline[]
    range: IRange
    ranges: IRange[]
}

interface ListTaskItem {
    type: 'list_task_item'
    checked: boolean
    ranges: IRange[]
    children: Inline[]
    range: IRange
}

type ContainerBlock = Blockquote | BlockquoteUnit | CodeBlock

type Block = ContainerBlock | LeafBlock

export type MAST = Block[]

export function parse (source: string): MAST