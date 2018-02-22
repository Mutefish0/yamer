{
    /**
    * var arr = ['a', ['b', ['c', 'd'], 'e'], 'f'] 
    * deepJoin(arr, '') -> 'abcdef'
    **/
    function deepJoin (arr, joint) {
        var plainStrArr = []
        arr.forEach(str => {
            if (str) {
                if (str instanceof Array) {
                    plainStrArr.push(deepJoin(str, joint))
                } else {
                    plainStrArr.push(str)
                }
            }
        })
        return plainStrArr.join(joint)
    }
    
    function languageAbbrTransform (language) {
        switch (language) {
            case 'js': 
                return 'javascript'
            case 'ts':
                return 'typescript'
            default:
                return language
        }
    }

    var linkReferenceDefinitionMap = {} 
    function defineLinkReference (name, info) {
        linkReferenceDefinitionMap[name] = info
        return info
    }
    function findLinkReference (name) {
        return linkReferenceDefinitionMap[name] || null
    }
}

start = 
    separator?blocks:block* { return blocks }

none_paragraph_block =    
    heading / thematic_break / code_block / link_reference_definition

block = 
    leaf_block // / container_block 

leaf_block = 
    heading / thematic_break / code_block / link_reference_definition / paragraph

//container_block = 

heading =  
    leading_indent indicator:('#' '#'?'#'?'#'?'#'?'#'?) ' '+value:character+separator  
    { return { type: 'heading', level: indicator.join('').length, content: value.join('') } }

thematic_break = 
    leading_indent (('*' '*' '*' '*'*) / ('-' '-' '-' '-'*) / ('_' '_' '_' '_'*)) separator
    { return { type: 'thematic_break' } }

language = 
    lan:('js' / 'javascript' / 'coffescript' / 'ts' / 'typescript' / 'html' / 'css' / 'ruby' / 'python' / 'java'  / 'go' /  'erlang' / 'c' / 'c++' / 'c#' / 'objective-c' / 'php' / 'swift' / 'r' / 'matlab')
    { return languageAbbrTransform(lan) }

code_block = 
    '```' lan:(language?) '\n' code:(code_pre*) '\n' '```' separator
    { return { type: 'code_block', content: deepJoin(code, ''), language: lan} }

link_reference_url =
    ('\n'[ ]* / [ ]*) url:[^\n" ]+
    { return encodeURI(url.join('')) }

link_reference_title = 
    ('\n'[ ]* / [ ]+) '"' title:[^"]+ '"'
    { return title.join('') }

link_reference_name = 
    name:[^\n\]\[]+
    { return name.join('') }

link_reference_definition = 
    leading_indent '[' name:link_reference_name ']:' url:link_reference_url title:link_reference_title? separator
    { return defineLinkReference(name, { type: "link_reference_definition", name: name, url: url, title: title }) }

link_reference = 
    leading_indent '[' name:character+ ']' &{ findLinkReference(name) != null }
    { return  findLinkReference(name) }

ignored_newline = 
    '\n' !(none_paragraph_block / '\n' / eof) { return ' ' }

paragraph = 
    value:((character+ignored_newline?)+)separator
    { return { type: 'paragraph', content: deepJoin(value, '') } }

character = escaped_indicator / [^\n]

leading_indent = 
    ' '?' '?' '?

code_pre = '`'!'``' / '\n'!'`' / [^\n`]

separator = ' '*('\n'+eof? / eof)

escaped_indicator = ei:('\\#' / '\\*' / '\\-' / '\\_' / '\\~' / '\\`') { return ei[1] }

eof = !.