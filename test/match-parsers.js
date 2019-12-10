module.exports = {
    classes_parser(match, pos) {
        return match[pos] ?
            match[pos].split('.').slice(1).map(name => name.toLowerCase()) :
            null
    },
    id_parser(match, pos) {
        return match[pos] ?
            match[pos].substr(1).toLowerCase() :
            null
    },
    string_parser(match, pos) {
        return match[pos] ?
            match[pos + 1] || match[pos + 2] || match[pos + 3] :
            null;
    },
    equals_parser(match, pos) {
        return match[pos] ?
            match[pos].trim() :
            null;
    },
    attr_parser(match, pos) {
        if (!match[pos]) return null; //:)
        return {
            ELMT: match[pos + 1].toLowerCase(),
            operator: this.parse(this.EQUALS, match, pos + 3),
            value: this.parse(this.STRING, match, pos + 4)
        }
    },
    elmt_restriction_parser(match, pos) {
        if (!match[pos]) return null; //:)
        return {
            id: this.parse('ID', match, pos + 1),
            classes: this.parse('CLASSES', match, pos + 2),
            attr: this.parse('ATTR', match, pos + 4)
        }
    },
    elmt_parser(match, pos) {
        if (!match[pos]) return null; //:)
        let elmt = match[pos + 1].toLowerCase();
        let rest = match[pos].substr(elmt.length);
        let classes, attrs, id, parsed;
        for (let match of this.iterator(this.ELMT_RESTRICTION, rest)) {
            parsed = this.parse(this.ELMT_RESTRICTION, match);
            if (parsed.classes) {
                classes = classes || [];
                classes = classes.concat(parsed.classes);
            } else if (parsed.attr) {
                attrs = attrs || [];
                attrs.push(parsed.attr);
            } else if (parsed.id) {
                if (id) throw new Error("PATTERNS Error: Ya se ha indicado un id de elemento.");
                id = parsed.id;
            }
        }
        return {
            elmt,
            classes,
            attrs,
            id
        }
    },
    combinators_parser(match, pos) {
        return match[pos] ?
            match[pos].trim() || ' ' :
            null
    }
}