var fs = require('fs')
var path = require('path')

var manifest = [
    'heading#1',
    'heading#2',
    'thematic-break',
    'code-block',
    'link-reference-definition'
]

module.exports = manifest.map(label => {
    return {
        name: label,
        source: fs.readFileSync(`${__dirname}/${label}.md`, 'utf8'),
        ast: JSON.parse(fs.readFileSync(`${__dirname}/${label}.json`, 'utf8'))
    }
})