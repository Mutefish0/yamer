import CoreEditor from 'browser/modules/core-editor'

enum Inline {
    Code,
    Emphasis,
    Italic,
    Strikethrough,
    Link,
    Image
}

enum LeafBlock {
    Heading,
    HorizontalLine,
    CodeBlock,
    Paragraph
}

enum ContainerBlock {
    Blockquote,
    UnorderedList
}


class MarkdownEmitter extends CoreEditor {
    onLineFeed (prevLineContent) {
        let match = prevLineContent.match(/^\s*#\s+(\S+)$/)
        if (match) {
            console.log(match[1])
        }
        
    }
}

export default MarkdownEmitter