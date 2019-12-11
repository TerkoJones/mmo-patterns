const log = require('mmo-logger')('output.log', {
    depth: 3,
    compact: 2
});
const patterns = require('./patterns1');
log(patterns.toString());

console.log(patterns.exec('CLASS', '.class'));

log_test(patterns, patterns.ID, '#elmt #main-id');
log_test(patterns, patterns.CLASSES, '.class.ELMT .otra.class.mas');
log_test(patterns, patterns.STRING, 'texto libre "texto dobles comillas" \'texto comillas simples\'');
log_test(patterns, patterns.EQUALS, '= *= ~=');
log_test(patterns, patterns.ATTR, '[attr] [attr="value"] [attr=value] [attr=\'value\']');
log_test(patterns, patterns.ELMT_RESTRICTION, '#id.class[attr]');
log_test(patterns, patterns.ELMT, 'ELMT#id.class[attr] *.alerts');
log_test(patterns, patterns.COMBINATORS, 'para > por  + segun  ~ sin mas');


const parser = patterns.create('ELMT ,ID ,CLASSES ATTR COMBINATORS')

log_parser(parser, "DIV.main > input[type=button]")

//
// APOYO
//

function log_parser(parser, string) {

    log('\nTest de parser <%s> para "%s"', parser.toString(), string);
    for (let it of parser.iterator(string)) {
        log(it);
    }

}

function log_test(pats, name, string) {
    name = isNaN(name) ? name : pats.name(name);
    log('\nTest de %s para "%s"', name, string);
    const m = pats.exec(name, string);
    for (let it of pats.iterator(name, string)) {
        log('match: %s', match_toString(it));
        log('  parsed: "%s"', pats.parse(name, it));
    }

}

function log_exec(pats, ELMT, string) {
    ELMT = isNaN(ELMT) ? ELMT : pats.ELMT(ELMT);
    log('\nMatch de %s para <%s>', ELMT, string);
    for (let it of pats.iterator(ELMT, string)) {
        log(match_toString(it));
    }
}

function log_match(m) {
    if (!m) log("Sin coincidencia");
    log('"%s"', m[0]);
    for (let i = 1; i % m.length; i++) log('%d) "%s"', i, m[i] ? m[i] : '');
}

function match_toString(m) {
    if (!m) return "<No Match>";
    let str = '"' + m[0] + '"';
    for (let i = 1; i < m.length; i++) {
        str += '\n  ' + i.toString().padStart(2, '0') + ') "' + (m[i] ? m[i] : '') + '"';
    }
    return str;
}