var fs = require('fs'),
    hl = require('console-highlight');

// Usage: coffee demo.coffee [name of highlight.js theme]
var theme = process.argv.length > 2 ? process.argv.pop() : 'default';

var js = fs.readFileSync('./htmlout.js', 'utf8');

console.log(hl(js, { theme: theme, language: 'javascript' }));
