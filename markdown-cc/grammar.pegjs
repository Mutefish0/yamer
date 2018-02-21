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
    '```' lan:(language?) '\n' code:(pre*) '\n' '```' 
    { return { type: 'code_block', content: code, language: lan} }

paragraph = 
    value:((character+ignored_newline?)+)separator
    { return { type: 'paragraph', content: deepJoin(value, '') } }

character = escaped_indicator / [^\n]

language = 'js' / 'javascript' / 'coffescript' / 'typescript' / 'html' / 'css' / 'ruby' / 'python' / 'java'  / 'go' /  'erlang' / 'c' / 'c++' / 'c#' / 'objective-c' / 'php' / 'swift' / 'r' / 'matlab'

pre = escaped_indicator / '`'!'``'

separator = '\n'+eof? / eof 

escaped_indicator = ei:('\\#' / '\\*' / '\\-' / '\\_' / '\\~' / '\\`') { return ei[1] }

ignored_newline = '\n' !leaf_block { return '' }

eof = !.