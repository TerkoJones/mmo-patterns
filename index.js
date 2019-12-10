const
    errors = require('mmo-errors')('PATTERNS');

const
    $pat = Symbol('patterns'),
    $lst = Symbol('list'),
    $rex = Symbol('regexp'),
    $psr = Symbol('parser');

const
    MARK_CHAR = '%',
    ESCAPED_MARK = MARK_CHAR.repeat(2),
    PLACEHOLDER_REX = ESCAPED_MARK + '|' + MARK_CHAR + '[A-Za-z][A-Za-z0-9_]*';

const
    REX = new RegExp(PLACEHOLDER_REX, 'g');

const
    NULL_PARSER = () => undefined;

module.exports = class RegExpPatterns {
    constructor(patterns) {
        let
            map = {},
            lst = [],
            idc = 0,
            repeat,
            key;

        for (let k in patterns) {
            key = k.toUpperCase();
            map[key] = {
                source: patterns[k],
                id: idc,
                name: key
            }
            Object.defineProperty(this, key, {
                value: idc++,
                enumerable: true,
                writable: false,
                configurable: true
            })
        }


        do {
            repeat = false;
            for (let k in map) {
                map[k].source = map[k].source.replace(REX, m => {
                    if (m === ESCAPED_MARK) return MARK_CHAR; //:)>
                    const replacer = map[m.substr(1).toUpperCase()].source;
                    if (replacer === undefined) return m; //:)>
                    repeat = true;
                    return replacer;
                })
            }
        } while (repeat);
        this[$lst] = Object.keys(map).map(k => map[k]); // ????
    }

    [$rex](ix, flags = 'g') {
        return new RegExp(this[$lst][ix].source, flags);
    }

    [$psr](ix, match, pos = 0) {
        return this[$lst][ix].parser.call(this, match, pos);
    }



    source(id) {
        id = _to_index.call(this, id);
        return this[$lst][id].source;
    }

    name(ix) {
        return this[$lst][ix].name;
    }

    regexp(id, flags) {
        id = _to_index.call(this, id);
        return this[$rex](id, flags);
    }

    exec(id, string, flags) {
        return this.regexp(id, flags).exec(string);
    }

    test(id, string, flags) {
        id = _to_index.call(this, id);
        const m = this[$rex](id, flags).exec(string);
        return this[$psr](id, m);
    }

    parse(id, match, pos) {
        id = _to_index.call(this, id);
        return this[$psr](id, match, pos);
    }


    parser(id, demo, fn) {
        if (typeof id === 'object') {
            let
                name,
                demo,
                fn;

            for (let k in id) {
                name = k.toUpperCase();
                [demo, fn] = id[k];
                _add_parser.call(this, name, demo, fn);
            }
        } else {
            _add_parser.call(this, id, demo, fn);
        }

    }

    create(...args) {
        const
            sep = /\s*,\s*|\s+/g;
        let
            keys = [],
            arg;
        for (let i = 0; i < args.length; i++) {
            arg = args[i];
            if (Array.isArray(arg)) {
                keys = keys.concat(arg.map(k => k.toUpperCase()))
            } else { // asume string
                keys = keys.concat(arg.split(sep).map(k => k.toUpperCase()));
            }
        }
        return new RegExpPatternParser(this, keys);
    };

    * iterator(id, string, flags) {
        const rex = this.regexp(id, flags);
        let m;

        while ((m = rex.exec(string)) != null) yield m;
    }

    toString() {
        let
            str = '',
            it;
        for (let it of this[$lst]) {
            str += it.id.toString().padStart(2) + ') ' + it.name.padEnd(10, '.') + ': ' + it.source + '\n';
        }
        return str;
    }
}


class RegExpPatternParser {
    constructor(patterns, keys) {
        const
            lst = [];
        let
            key, it, pat, pos;

        for (let i = 0; i < keys.length; i++) {
            key = keys[i];
            it = patterns[$lst][patterns[key]];
            if (!it) throw errors('No existe nigún patrón con el nombre "%s"', key);
            if (!it.parser) throw errors('El patrón "%s" carece de analizador.', key);
            lst.push(it);
        }

        it = lst[0];
        pat = '(' + it.source + ')';
        pos = it.pos = 1;
        for (let i = 1; i < lst.length; i++) {
            pos += it.length;
            it = lst[i];
            pat += '|(' + it.source + ')';
            it.pos = pos;
        }
        this[$rex] = new RegExp(pat, 'g');
        this[$lst] = lst;
        this[$pat] = patterns;
    }

    get source() {
        return this[$rex].source;
    }

    exec(string, lastIndex) {
        if (lastIndex !== undefined) this[$rex].lastIndex = lastIndex;
        return this[$rex].exec(string);
    }

    parse(match) {
        let
            tk, it;
        for (let i = 0; i < this[$lst].length; i++) {
            it = this[$lst][i];
            tk = this[$pat][$psr](it.id, match, it.pos);
            if (tk) {
                return {
                    type: it.id,
                    name: it.name,
                    value: tk
                }; //:)>
            }
        }
        return null;
    }

    * iterator(string) {
        let m;
        this[$rex].lastIndex = 0;
        while ((m = this[$rex].exec(string)) != null) yield this.parse(m);
    }

    toString() {
        let str = this[$lst][0].name;
        for (let i = 1; i < this[$lst].length; i++) {
            str += ", " + this[$lst][i].name;
        }
        return str;
    }
}

function _to_index(id) {
    id = isNaN(id) ? this[id] : id;
    if (isNaN(id) || !this[$lst][id]) throw errors.Range('Se esperaba índice o nombre de patrón existente.')
    return id;
}

function _add_parser(id, demo, fn) {
    id = _to_index.call(this, id);
    if (demo) {
        const rex = this.regexp(id);
        const m = rex.exec(demo);
        if (!m) throw errors('El argumento "%s" no cumple con el patrón %s.', demo, this[$lst][id].name)
        this[$lst][id].length = m.length;
        this[$lst][id].parser = fn;
        return;
    }
    return this[$lst][id].parser;
}