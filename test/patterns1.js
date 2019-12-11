 const matchParser = require('./match-parsers');

 const patterns = module.exports = require('../index')({
     ALL: '\\*',
     NMCHAR: '[_a-zA-Z0-9-]',
     NMSTART: '[_a-zA-Z]',
     IDENT: '%NMSTART%NMCHAR*',
     ID: '#%IDENT',
     CLASS: "\\.%IDENT",
     CLASSES: "(%CLASS)+",
     STRING1: '"([\\s\\u0021\\u0023-\\u007e\\u00a1-\\u0860]*)"',
     STRING2: '\'([\\s\\u0021-\\u0026\\u0028-\\u007e\\u00a1-\\u0860]*)\'',
     STRING3: '([A-Za-z0-9-_]+)',
     STRING: "%STRING1|%STRING2|%STRING3",
     EQUALS: '\\s*(\\^=|\\*=|\\$=|\\|=|\\~=|=)\\s*',
     ATTR: '\\[(%IDENT)(%EQUALS(%STRING))?\\]\\s*',
     ELMT: '(%IDENT|%ALL)((%ID)?(%CLASSES)?(%ATTR)?)*',
     ELMT_RESTRICTION: '(%ID)|(%CLASSES)|(%ATTR)',
     COMBINATORS: "(\\s*\\+\\s*)|(\\s*~\\s*)|(\\s*>\\s*)|(\\s+)"
 });

 patterns.parser({
     CLASSES: ['.demo', matchParser.classes_parser],
     ID: ['#demo', matchParser.id_parser],
     STRING: ['demo', matchParser.string_parser],
     EQUALS: ['=', matchParser.equals_parser],
     ATTR: ['[demo]', matchParser.attr_parser],
     ELMT_RESTRICTION: ['.demo', matchParser.elmt_restriction_parser],
     ELMT: ['[demo]', matchParser.elmt_parser],
     COMBINATORS: ['>', matchParser.combinators_parser]
 })