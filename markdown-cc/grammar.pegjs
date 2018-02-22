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
}

start = 
    separator?blocks:block* { return blocks }

block = 
    leaf_block / container_block 

leaf_block = 
    heading / thematic_break / code_block

container_block = 
    paragraph

heading =  
    ' '?' '?' '? indicator:('#' '#'?'#'?'#'?'#'?'#'?) ' '+value:character+separator  
    { return { type: 'heading', level: indicator.join('').length, content: value.join('') } }

thematic_break = 
    ' '?' '?' '? (('*' '*' '*' '*'*) / ('-' '-' '-' '-'*) / ('_' '_' '_' '_'*)) ' '*separator
    { return { type: 'thematic_break' } }


code_block = 
    '```' lan:(language?) '\n' code:(code_pre*) '\n' '```' separator
    { return { type: 'code_block', content: deepJoin(code, ''), language: lan} }

paragraph = 
    value:((character+ignored_newline?)+)separator
    { return { type: 'paragraph', content: deepJoin(value, '') } }

character = escaped_indicator / [^\n]

language = 
    lan:('js' / 'javascript' / 'coffescript' / 'ts' / 'typescript' / 'html' / 'css' / 'ruby' / 'python' / 'java'  / 'go' /  'erlang' / 'c' / 'c++' / 'c#' / 'objective-c' / 'php' / 'swift' / 'r' / 'matlab')
    { return languageAbbrTransform(lan) }

code_pre = '`'!'``' / '\n'!'`' / [^\n`]

separator = '\n'+eof? / eof 

escaped_indicator = ei:('\\#' / '\\*' / '\\-' / '\\_' / '\\~' / '\\`') { return ei[1] }

ignored_newline = '\n' !(leaf_block / '\n' / eof) { return ' ' }

eof = !.