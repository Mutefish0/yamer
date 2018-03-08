
var fs = require('fs') 
var path = require('path')
var pegjs = require('pegjs')
const grammar = fs.readFileSync(__dirname + '/grammar.pegjs', 'utf-8');

var Parser = pegjs.generate(grammar, { trace: false, "output": "source", "format": "commonjs" })

fs.writeFileSync(path.join(__dirname, '../libs/markdown.js'), Parser);

const typeDefinition = fs.readFileSync(__dirname + '/index.d.ts', 'utf-8');
fs.writeFileSync(path.join(__dirname, '../libs/markdown.d.ts'), typeDefinition);
