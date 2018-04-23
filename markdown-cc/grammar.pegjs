/**
  notice, for lightweight and simple:
    * URL are not encoded. (In browser, can use `encodeURI`)
    * Part of HTML entities which are common used are parsed and trsnformed.
    * HTML tags are not support, will output original text. For safety, in browser, don't use `innerHTML`, use `innerText` instead.

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
    blocks:block*

block = 
    container_block / leaf_block

leaf_block = 
    block:(heading / list / thematic_break / link_reference_definition / blank_lines / paragraph)

container_block = 
    block:(code_block / blockquote)

blank_lines =
    _0:_ '\n'+ _1:_
    { return { type: 'blank_lines', range: [_0,_1] } }

heading =  
    _0:_ leading_indent _1:_ indicator:('#' '#'?'#'?'#'?'#'?'#'?) _2:_ ' '+ cs:_ value:inline+ ce:_ separator _3:_ 
    { 
        return { 
            type: 'heading', level: indicator.join('').length, children: value,
            range: [_0,_3], ranges: { prefix: [_1,_2], children: [cs,ce] }
        } 
    }

thematic_break = 
    _0:_
        leading_indent (('*' '*' '*' '*'*) / ('-' '-' '-' '-'*) / ('_' '_' '_' '_'*)) separator
    _1:_
    { 
        return { type: 'thematic_break', range: [_0,_1] } 
    }

language = 
    lan:('bash' / 'md'/ 'markdown'/ 'diff' / 'js' 
        / 'javascript' / 'coffescript' / 'ts' / 'typescript' / 'html' 
        / 'css' / 'ruby' / 'python' / 'java'  / 'go' /  'erlang' / 'c' 
        / 'c++' / 'c#' / 'objective-c' / 'php' / 'swift' / 'r' / 'matlab'
        )?
    { return languageAbbrTransform(lan) }

code_pre = '`'!'``' / '\n'!'```' / [^\n`]

code_block = 
    _0:_
        _1:_ '```' _2:_ space* 
        _3:_ lan:language _4:_ '\n' 
        code:code_pre*
        '\n' _5:_ '```' _6:_ separator
    _7:_
    { 
        return { 
            type: 'code_block', content: deepJoin(code, ''), language: lan, range: [_0,_7], 
            ranges: { prefix: [_1,_2], language: [_3,_4], suffix: [_5,_6] }
        } 
    }


blockquote_unit_children =
    lb:leaf_block &{ return !(lb.type == 'blank_lines' || lb.isbq) } 
    { return lb }

blockquote_unit =
    _0:_
        leading_indent _1:_ '>' _2:_ space* 
        cs:_ value:(block:blockquote_unit_children !code_block { return block })+ ce:_
    _3:_
    { 
        return { 
            type: 'blockquote_unit', children: value, range: [_0,_3], 
            ranges: { prefix: [_1,_2], children: [cs,ce] }
        } 
    }

blockquote =
    _0:_
        value:blockquote_unit+
    _1:_
    { return { type: 'blockquote', children: value, range: [_0,_1] } }

link_ref_title = 
    (space*'\n'space* / space+) '"' title:(special_character / [^"\n] / '\n'!'\n')+ '"'
    { return deepJoin(title, '') }

link_name = 
    _0:_ (special_character / [^\n\]\[])+ _1:_
    { return { type: 'text', content: text(), range: [_0,_1] } }

link_reference_definition = 
    _0:_
        leading_indent '[' _1:_ name:link_name _2:_ ']:' space*'\n'?space* 
        _3:_ url:url _4:_ title:link_ref_title? _5:_  separator
    _6:_
    { 
        return defineLinkReference(name.content, { 
            type: "link_reference_definition", 
            url: url.content, title: title, name: name,
            range: [_0,_6], ranges: { name: [_1,_2], url: [_3,_4], title: [_4,_5] }
        }) 
    }

list =
    _0:_
        first:(list_task_item / list_item)
        rest:(
            (l:(list_task_item / list_item) &{ return l.leading == first.leading } { return l }) /
            (l:list_level2 &{ return l.leading > first.leading } { return l })
        )*
    _1:_
    { return { type: 'list',  leading: first.leading, children: [first].concat(rest), range: [_0,_1]} }

list_item = 
    _0:_
        leading:space* _1:_ [*-] _2:_ collapsed_whitespace 
        cs:_ value:(inline / (_00:_ [\n]!([\n] / list_item) _01:_ { return { type: 'hard_break', range: [_00,_01] } }))+ ce:_ separator
    _3:_
    { 
        return { 
            type: 'list_item', leading: computeSpaceCount(leading.join('')), 
            children: value, range: [_0,_3], ranges: { prefix: [_1,_2], children: [cs,ce] }
        } 
    }

list_task_item = 
    _0:_
        leading:space* _1:_ [*-] _2:_ space '[' _3:_ check:(space / 'x') _4:_ ']' 
        space cs:_ value:(inline / (_00:_ [\n]!([\n] / list_item) _01:_ { return { type: 'hard_break', range: [_00,_01] } }))+ ce:_ separator
    _5:_
    { 
        return { 
            type: 'list_task_item', checked: check == 'x', 
            leading: computeSpaceCount(leading.join('')), children: value, range: [_0,_5], 
            ranges: { prefix: [_1,_2], check: [_3,_4], children: [cs,ce] }
        } 
    }

list_level2 = 
    _0:_
        first:(list_task_item / list_item)
        rest:(l:(list_task_item / list_item) &{ return l.leading == first.leading } { return l })*
    _1:_
    { return { type: 'list',  leading: first.leading, children: [first].concat(rest), range: [_0,_1] } }

block_exclude_paragraph = 
    block:block &{ return block.type != 'paragraph' } { return block }

paragraph_newline = 
    _0:_ '\n' !(block_exclude_paragraph / '\n' / eof) _1:_
    { return { type: 'text', content: ' ', range: [_0,_1] } }

paragraph = 
    _0:_ value:(inline / paragraph_newline)+ _ce:_ separator _1:_
    // isbq 用来判断当前paragraph是否为blockquote，因为leafblock中没有包含blockquote
    // 在blockquote_unit中需要用到
    { return { 
        type: 'paragraph', children: value, isbq: /^[ ]{0,3}>/.test(text()), 
        range: [_0,_1], ranges: { children: [_0,_ce] } 
    } }

character = special_character / [^\n]

leading_indent = 
    ' '?' '?' '?

separator = space*('\n'eof? / eof)

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
    _0:_ [`*_~\\\[!<] _1:_
    { return { type: 'text', content: text(), range: [_0,_1] } } 

text_without_inline_indicator = 
    _0:_ character_without_inline_indicator+ _1:_
    { return { type: 'text', content: text(), range: [_0,_1] } } 

inline = 
    inline:(hard_break / keyboard / code / image / inline_link / strong_emphasis / strong / emphasis / strikethrough / text_without_inline_indicator / inline_indicator)

keyboard = 
    _0:_ '`kbd' _1:_ space+ code:(special_character / [^\n`] / collapsed_whitespace)+ _2:_ '`' _3:_ 
    { 
        return { 
            type: 'keyboard', content: trim(deepJoin(code, '')), 
            range: [_0,_3], ranges: { prefix: [_0,_1], suffix: [_2,_3] }
        } 
    }

code = 
    _0:_ '`' _1:_ code:(special_character / [^\n`] / collapsed_whitespace)+ _2:_ '`' _3:_
    { 
        return { 
            type: 'code', content: trim(deepJoin(code, '')), 
            range: [_0,_3], ranges: { prefix: [_0,_1], suffix: [_2,_3] }
        } 
    }

emphasis =
    _0:_ marker_start:[*_]!space
    em:(special_character / char:[^\n] &{ return char != marker_start } / collapsed_whitespace)+ 
    marker_end:[*_] &{ return marker_start == marker_end } _1:_
    { return { type: 'emphasis', content: trim(deepJoin(em, '')), range: [_0,_1] } }

strong = 
    _0:_ marker_start:('**' / '__')!space
    strong:(special_character / char:[^\n] &{ return char != marker_start[0] } / collapsed_whitespace)+
    marker_end:('**' / '__') &{ return marker_start == marker_end } _1:_ 
    { return { type: 'strong', content: trim(deepJoin(strong, '')), range: [_0,_1] } }

strong_emphasis =  
    _0:_ marker_start:('***' / '___')!space
    strong_emphasis:(special_character / char:[^\n] &{ return char != marker_start[0] } / collapsed_whitespace)+
    marker_end:('***' / '___') &{ return marker_start == marker_end } _1:_
    { return { type: 'strong_emphasis', content: trim(deepJoin(strong_emphasis, '')), range: [_0,_1] } }

strikethrough = 
    _0:_ s:'~'+ strikethrough:(special_character / char:[^\n~] / collapsed_whitespace)+ '~'+ _1:_
    { return { type: 'strikethrough', content: trim(deepJoin(strikethrough, '')), range: [_0,_1] } }

inline_link = 
    link / link_reference / autolink

url =  
    _0:_ ('https' / 'http' / 'ftp') '://' [a-zA-Z0-9\-_&%=?#./]+ _1:_
    { return { type: 'text', content: text(), range: [_0,_1] } }

autolink = 
    _0:_ '<' space* _1:_ url:url _2:_ space* '>' _3:_
    { 
        return {
            type: 'link', url: url.content, title: '',
            children: [url], range: [_0,_3], ranges: { 'name url': [_1,_2] }
        }
    }

link_child = 
    inline:( 
        image / strong_emphasis / strong / emphasis / strikethrough 
        / (_0:_ [^\n`*_~\\\[\]!<]+ _1:_ { return { type: 'text', content: text(), range: [_0,_1] } })
        / (_0:_ [`*_~\\\[!<] _1:_ { return { type: 'text', content: text(), range: [_0,_1] } })
    )

link_title = 
    space+ '"' title:(special_character / [^\n\"])+ '"'
    { return title.join('') }

link =
    _0:_ 
        '[' _1:_ children:link_child+ _2:_ '](' space* 
        _3:_ url:url _4:_ title:link_title? space* ')'
    _5:_
    { 
        return { 
            type: 'link', url: url.content, title: title, children: children,
            range: [_0,_5], ranges: { 'children#name': [_1,_2], url: [_3,_4] }
        } 
    }

link_reference = 
    _0:_ '[' name:link_name ']' _1:_  &{ return findLinkReference(name.content) != null } 
    {
        var ref = findLinkReference(name.content); 
        return Object.assign({}, ref, 
            { type: 'link', range: [_0,_1], children: [name], ranges: { 'children#name': name.range }  }
        ) 
    }

image = 
    _0:_
        '![' _1:_ name:link_name _2:_ '](' space* 
        _3:_ url:url _4:_ title:link_title? space* ')'
    _5:_
    { 
        return { 
            type: 'image', name: name.content, url: url.content, title: title, 
            range: [_0,_5], ranges: { name: [_1,_2], url: [_3,_4] }
        } 
    }

hard_break = 
    _0:_ '\\\n' _1:_
    { return { type: 'hard_break', range: [_0,_1] } }

// offset marker
_ = '' { return location().start.offset }