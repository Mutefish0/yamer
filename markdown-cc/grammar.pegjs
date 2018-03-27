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

        // customize
        '&yuan;': '¥', // CNY/RMB (Currency)

        '&apple;': '', // Apple
        '&icmd;': '⌘', // Apple Command Key
        '&iopt;': '⌥', // Apple Option Key
        '&ishift;': '⇧', // Apple Shift Key
        '&ictrl;': '⌃', // Apple Control Key
        '&idelete;': '⌫', // Apple Delete Key
        '&iesc;': '⎋' // Apple Esc Key
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
            case 'md':
                return 'markdown'
            case null:
                return 'shell'
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
    blocks:block* { return { entities: blocks, source: text() } }

block = 
    container_block / leaf_block

leaf_block = 
    block:(heading / list / thematic_break / link_reference_definition / blank_lines / paragraph)
    { return Object.assign({}, block, { location: location() }) }

container_block = 
    block:(code_block / blockquote)
    { return Object.assign({}, block, { location: location() }) }

blank_lines = 
    '\n'+
    { return { type: 'blank_lines' } }

heading =  
    leading_indent indicator:('#' '#'?'#'?'#'?'#'?'#'?) ' '+value:inline+ separator  
    { return { type: 'heading', level: indicator.join('').length, children: value } }

thematic_break = 
    leading_indent (('*' '*' '*' '*'*) / ('-' '-' '-' '-'*) / ('_' '_' '_' '_'*)) separator
    { return { type: 'thematic_break' } }

language = 
    lan:('bash' / 'md'/ 'markdown'/ 'diff' / 'js' / 'javascript' / 'coffescript' / 'ts' / 'typescript' / 'html' / 'css' / 'ruby' / 'python' / 'java'  / 'go' /  'erlang' / 'c' / 'c++' / 'c#' / 'objective-c' / 'php' / 'swift' / 'r' / 'matlab')?
    { return languageAbbrTransform(lan) }

code_block = 
    '```' space* lan:language '\n' code:(cp:code_pre* { return { type: 'text', content: deepJoin(cp, ''), location: location() } }) '\n' '```' separator
    { return { type: 'code_block', children: [code], language: lan} }

_exclude_code_block_and_blank_lines = 
    block: block &{ return ['code_block', 'blank_lines'].indexOf(block.type) == -1 } 
    { return block }

leaf_block_exclude_blank_lines =
    lb:leaf_block &{ return lb.type != 'blank_lines' } { return lb }

blockquote_unit_children =
    lb:leaf_block &{ return !(lb.type == 'blank_lines' || lb.isbq) } 
    { return lb }

blockquote_unit = 
    leading_indent '>' space* value:(block:blockquote_unit_children !code_block { return block })+
    { return { type: 'blockquote_unit', children: value, location: location() } }

blockquote = 
    value:blockquote_unit+
    { return { type: 'blockquote', children: value } }

link_reference_title = 
    ('\n'[ ]* / [ ]+) '"' title:(special_character / [^"])+ '"'
    { return title.join('') }

link_reference_name = 
    name:(special_character / [^\n\]\[])+
    { return name.join('') }

link_reference_definition = 
    leading_indent '[' name:link_reference_name ']:' '\n'?space* url:url title:link_reference_title? separator
    { 
        return defineLinkReference(name, { 
            type: "link_reference_definition", 
            name: name, 
            url: url.content, 
            title: title,
            children: [url]
        }) 
    }

list = 
    first:(list_task_item / list_item)
    rest:(
        (l:(list_task_item / list_item) &{ return l.leading == first.leading } { return l }) /
        (l:list_level2 &{ return l.leading > first.leading } { return l })
    )*
    { return { type: 'list',  leading: first.leading, children: [first].concat(rest)} }

list_item = leading:space* [*-]collapsed_whitespace value:(inline / ([\n]!([\n] / list_item) { return { type: 'hard_break', location: location() } }))+ separator
    { return { type: 'list_item', leading: computeSpaceCount(leading.join('')), children: value, location: location() } }

list_task_item = 
    leading:space* [*-] space '[' check:((space / 'x') { return { checked: text() == 'x', location: location() } }) ']' space value:(inline / ([\n]!([\n] / list_item) { return { type: 'hard_break', location: location() } }))+ separator
    { return { type: 'list_task_item', checked: check.checked, reactLocation: check.location, leading: computeSpaceCount(leading.join('')), children: value, location: location() } }

list_level2 = 
    first:(list_task_item / list_item)
    rest:(l:(list_task_item / list_item) &{ return l.leading == first.leading } { return l })*
    { return { type: 'list',  leading: first.leading, children: [first].concat(rest)} }

block_exclude_paragraph = 
    block:block &{ return block.type != 'paragraph' } { return block }

paragraph_newline = 
    '\n' !(block_exclude_paragraph / '\n' / eof)
    { return { type: 'text', content: ' ', location: location() } }

paragraph = 
    value:(inline / paragraph_newline)+ separator 
    // isbq 用来判断当前paragraph是否为blockquote，因为leafblock中没有包含blockquote
    // 在blockquote_unit中需要用到
    { return { type: 'paragraph', children: value, isbq: /^[ ]{0,3}>/.test(text()) } }

character = special_character / [^\n]

leading_indent = 
    ' '?' '?' '?

code_pre = '`'!'``' / '\n'!'```' / [^\n`]

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

character_without_inline_indicator = special_character / [^\n`*_~\\\[!<]

inline_indicator = 
    char:[`*_~\\\[!<]
    { return { type: 'text', content: char } } 

text_without_inline_indicator = 
    text:character_without_inline_indicator+
    { return { type: 'text', content: deepJoin(text, '') } } 

inline = 
    inline:(hard_break / code / image / inline_link / strong_emphasis / strong / emphasis / strikethrough / text_without_inline_indicator / inline_indicator)
    { return Object.assign({}, inline, { location: location() }) }

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

url =  
    ('https' / 'http' / 'ftp') '://' [a-zA-Z0-9\-&%=?#./]+
    { return { type: 'url', content: text(), location: location() } }

autolink = 
    '<' space* url:url space* '>'
    { 
        return {
            type: 'link', 
            url: url.content, 
            name: url.content, 
            title: '',
            children: [url]
        }
    }

link =
    '[' name:(special_character / [^\n\]\[])+ '](' space* url:url title:(space+ '"' t:(special_character / [^\n\"])+ '"' { return t })? space* ')'
    { 
        return { 
            type: 'link', 
            name: name.join(''), 
            url: url.content, 
            title: title ? title.join('') : name.join(''),
            children: [url]
        } 
    }

link_reference = 
    '[' name:(special_character / [^\n\]\[])+ ']'  &{ return findLinkReference(name.join('')) != null } 
    {
        var ref = findLinkReference(name.join('')); 
        return Object.assign({}, ref, { type: 'link' }) 
    }

image = 
    '![' name:(special_character / [^\n\]\[])+ '](' space* url:[^\n" \(\)]+ title:(space+ '"' t:(special_character / [^\n\"])+ '"' { return t })? space* ')'
    { return { type: 'image', name: name.join(''), url: url.join(''), title: title ? title.join('') : name.join('') } }

hard_break = 
    '\\\n' 
    { return { type: 'hard_break' } }

