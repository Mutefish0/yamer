
var fs = require('fs') 
var pegjs = require('pegjs')
const grammar = fs.readFileSync(__dirname + '/grammar.pegjs', 'utf-8');

var Parser = pegjs.generate(grammar, { trace: false })

module.exports = Parser