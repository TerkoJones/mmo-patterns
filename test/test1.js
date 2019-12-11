const patterns = require('../index')({
    NMCHAR: '[_a-zA-Z0-9-]',
    NMSTART: '[_a-zA-Z]',
    IDENT: '%NMSTART%NMCHAR*',
    ID: '#%IDENT',
    CLASS: "\\.%IDENT",
})

function id_class_parser(match, pos) {
    return match[pos] ?
        match[pos].substr(1) :
        null
}

let m = patterns.exec('CLASS', '.class');

console.log(m);

patterns.parser({
    ID: ['#demo', id_class_parser],
    CLASS: ['.demo', id_class_parser]
})

console.log(patterns.parse('CLASS', m));

const parser = patterns.create('ID,CLASS');

for (let it of parser.iterator('#main.class')) console.log(it);