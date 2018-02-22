require('should')

var Parser = require('./compiler')

var samples = require('./samples')

describe('Markdown Parser', () => {
    samples.forEach(sample => {
        it(`${sample.name}...ok`, () => {
            var parsedAst = Parser.parse(sample.source) 
            parsedAst.should.containDeepOrdered(sample.ast)
        })
    })
})