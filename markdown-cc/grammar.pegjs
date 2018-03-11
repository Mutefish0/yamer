/**
  notice, for lightweight and simple:
    * URL are not encoded. (In browser, can use `encodeURI`)
    * Part of HTML entities which are common used are parsed and trsnformed.
    * HTML tags are not support, will output original text. For safety, in browser, don't use `innerHTML`, use `innerText` instead.
    * `Inline` can not nest other `Inline`.
**/

/**
@TODO 
 * Table
    数据结构：
    {
        head: ['a', 'b'],
        align: ['center', 'right'],
        rows: [
            ['1', '2'],
            ['3', '4'],
            ['5', '6']
        ]
    }

 * Task
**/


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

    function computeSpaceCount (str) {
        return str.replace(/\t/g, '    ').length
    }

    function trim (str) {
        return str.replace(/^space*/, '').replace(/space*$/, '')
    }

    /* enough for safety of documents with unicode */
    var escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        '\'': '&#39;'
    }
    function backslashEscape (str) {
        return escapeMap[str] || str
    }

    var entitiesMap = {
        '&copy;': '©', // Copyright
        '&reg;': '®',  // Registered	
        '&trade;': '™', // Trademark
        '&ldquo;': '“', // Curly Open Double Quote
        '&rdquo;': '”', // Curly Closed Double Quote
        '&lsquo;': '‘', // Curly Open Single Quote
        '&rsquo;': '’', // Curly Closed Single Quote
        '&bull;': '•',  // Big Bullet/Dot
        '&middot;': '·', // Small Bullet/Dot
        '&sdot;': '⋅', // Square Dot
        '&ndash;': '–', // En Dash
        '&mdash;': '—', // Em Dash
        '&cent;': '¢',  // Cents
        '&pound;': '£', // Pound (Currency)
        '&euro;': '€', // Euro (Currency)
        '&dollar;': '$', // Dollar
        '&yuan;': '¥', // CNY/RMB (Currency)

        '&ne;': '≠', // Not Equal To
        '&frac12;': '½', // Half (Fraction)
        '&frac14;': '¼', // Quarter (Fraction)
        '&frac34;': '¾', // Three-Quarters (Fraction)

        '&deg;': '°', // Degrees
        '&larr;': '←', // Left Arrow
		'&rarr;': '→', // Right Arrow
		'&uarr;': '↑', // Up Arrow
		'&darr': '↓', // Down Arrow

        '&hellip;': '…', // Ellipse
    }
    function getHtmlEntity (str) {
        return entitiesMap[str] || null
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
    container_block / heading / thematic_break / code_block / link_reference_definition / blank_lines

block = 
    container_block / leaf_block

leaf_block = 
    heading / list / thematic_break / code_block / link_reference_definition / blank_lines / paragraph

container_block = 
    blockquote 

blank_lines = 
    '\n'+
    { return { type: 'blank_lines' } }

heading =  
    leading_indent indicator:('#' '#'?'#'?'#'?'#'?'#'?) ' '+value:merged_inline+ separator  
    { return { type: 'heading', level: indicator.join('').length, children: value } }

thematic_break = 
    leading_indent (('*' '*' '*' '*'*) / ('-' '-' '-' '-'*) / ('_' '_' '_' '_'*)) separator
    { return { type: 'thematic_break' } }

language = 
    lan:('js' / 'javascript' / 'coffescript' / 'ts' / 'typescript' / 'html' / 'css' / 'ruby' / 'python' / 'java'  / 'go' /  'erlang' / 'c' / 'c++' / 'c#' / 'objective-c' / 'php' / 'swift' / 'r' / 'matlab')
    { return languageAbbrTransform(lan) }

code_block = 
    '```' lan:(language?) '\n' code:(code_pre*) '\n' '```' separator
    { return { type: 'code_block', content: deepJoin(code, ''), language: lan} }

blockquote = 
    leading_indent '>' space* value:((leading_indent '>' space*)?  lb:leaf_block &{ return lb.type != 'blank_lines' } { return lb } )+ separator
    { return { type: 'blockquote', children: value } }

link_reference_url =
    ('\n'[ ]* / [ ]*) url:[^\n" \(\)]+
    { return url.join('') }

link_reference_title = 
    ('\n'[ ]* / [ ]+) '"' title:(special_character / [^"])+ '"'
    { return title.join('') }

link_reference_name = 
    name:(special_character / [^\n\]\[])+
    { return name.join('') }

link_reference_definition = 
    leading_indent '[' name:link_reference_name ']:' url:link_reference_url title:link_reference_title? separator
    { return defineLinkReference(name, { type: "link_reference_definition", name: name, url: url, title: title }) }

list = 
    first:list_item 
    rest:(
        (l:list_item &{ return l.leading == first.leading } { return l }) /
        (l:list_level2 &{ return l.leading > first.leading } { return l })
    )*
    { return { type: 'list',  leading: first.leading, children: [first].concat(rest)} }

list_item = leading:space* [*-]collapsed_whitespace value:(merged_inline / ([\n]!([\n] / list_item) { return { type: 'hard_break' } }))+ separator
    { return { type: 'list_item', leading: computeSpaceCount(leading.join('')), children: value } }

list_level2 = 
    first:list_item 
    rest:(l:list_item &{ return l.leading == first.leading } { return l })*
    { return { type: 'list',  leading: first.leading, children: [first].concat(rest)} }

newline_between_paragraph = 
    '\n' !(none_paragraph_block / '\n' / eof)

inline_with_optional_newline = 
    inline:merged_inline nbp:newline_between_paragraph?
    { return nbp ? Object.assign({}, inline, { content: inline.content.concat(' ') }) : inline }

paragraph = 
    value:(inline_with_optional_newline+)separator
    { return { type: 'paragraph', children: value } }


character = special_character / [^\n]

leading_indent = 
    ' '?' '?' '?

code_pre = '`'!'``' / '\n'!'`' / [^\n`]

separator = space*('\n'eof? / eof)
{ return { type: '' } }

// ref: http://www.fileformat.info/info/unicode/category/Zs/list.htm
whitespace = 
    w:. &{ return /[\u0020\u00A0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]/.test(w) }
    { return w }

space = whitespace / [\t]

eof = !.

// pre-processed character
collapsed_whitespace = space+ { return ' ' }

trim_whitespace = space+

special_character = 
    backslash_escape / html_entity

backslash_escape = 
    be:('\\#' / '\\*' / '\\-' / '\\_' / '\\~' / '\\`' / '\\.' / '\\[' / '\\]' / 
    '\\<' / '\\>' / '\\&' / '\\\'' / '\\"')
    { return backslashEscape(be[1]) }

html_entity = 
    entity:('&'[a-z0-9]+';') &{ return getHtmlEntity(deepJoin(entity, '')) != null }
    { return getHtmlEntity(deepJoin(entity, '')) }

text_without_backslash = 
    (backslash_escape / html_entity / [^\n`])+

character_without_inline_indicator = special_character / [^\n`*_~\\\[!]

inline_indicator = 
    char:[`*_~\\\[!]
    { return { type: 'text', content: char} }

text_without_inline_indicator = text:character_without_inline_indicator+
    { return { type: 'text', content: deepJoin(text, '') } } 

inline = 
    hard_break / code / image / inline_link / strong_emphasis / strong / emphasis / strikethrough / text_without_inline_indicator / inline_indicator

merged_text = 
    ct: (il:inline &{ return il.type == 'text' }  { return il } )+
    {  return { type: 'text', content: ct.map(i => i.content).join('') } }

merged_inline = 
    hard_break / code / image / inline_link / strong_emphasis / strong / emphasis / strikethrough / merged_text

code = 
    '`' code:(special_character / [^\n`] / collapsed_whitespace)+ '`'
    { return { type: 'code', content: trim(deepJoin(code, '') ) } }

emphasis = 
    marker_start:[*_]!space
    em:(special_character / char:[^\n] &{ return char != marker_start } / collapsed_whitespace)+ 
    marker_end:[*_] &{ return marker_start == marker_end }
    { return { type: 'emphasis', content: trim(deepJoin(em, '') ) } }

strong = 
    marker_start:('**' / '__')!space
    strong:(special_character / char:[^\n] &{ return char != marker_start[0] } / collapsed_whitespace)+
    marker_end:('**' / '__') &{ return marker_start == marker_end }  
    { return { type: 'strong', content: trim(deepJoin(strong, '') ) } }

strong_emphasis =  
    marker_start:('***' / '___')!space
    strong_emphasis:(special_character / char:[^\n] &{ return char != marker_start[0] } / collapsed_whitespace)+
    marker_end:('***' / '___') &{ return marker_start == marker_end }  
    { return { type: 'strong_emphasis', content: trim(deepJoin(strong_emphasis, '') ) } }

strikethrough = 
    s:'~'+ strikethrough:(special_character / char:[^\n~] / collapsed_whitespace)+ '~'+
    { return { type: 'strikethrough', content: trim(deepJoin(strikethrough, '') ) } }

inline_link = 
    link / link_reference / autolink

autolink = 
    '<' [ ]* url:('http' 's'? '://' [a-zA-Z0-9&%=?#./]+) [ ]* '>'
    { return { type: 'link', url: deepJoin(url, ''), name: deepJoin(url, ''), title: deepJoin(url, '') } }

link =
    '[' name:(special_character / [^\n\]\[])+ '](' space* url:[^\n" \(\)]+ title:(space+ '"' t:(special_character / [^\n\"])+ '"' { return t })? space* ')'
    { return { type: 'link', name: name.join(''), url: url.join(''), title: title ? title.join('') : name.join('') } }

link_reference = 
    '[' name:(special_character / [^\n\]\[])+ ']'  &{ return findLinkReference(name.join('')) != null } 
    { var ref = findLinkReference(name.join('')); return Object.assign({}, ref, { type: 'link' }) }

image = 
    '![' name:(special_character / [^\n\]\[])+ '](' space* url:[^\n" \(\)]+ title:(space+ '"' t:(special_character / [^\n\"])+ '"' { return t })? space* ')'
    { return { type: 'image', name: name.join(''), url: url.join(''), title: title ? title.join('') : name.join('') } }

hard_break = 
    '\\\n' 
    { return { type: 'hard_break' } }

