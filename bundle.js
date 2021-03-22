const other = {
    other: 'UNRECOGNIZED'
};
function parse2(str) {
    const { length  } = str;
    let position = 0;
    const bounds = [];
    const input = {
        done () {
            return position >= length;
        },
        at (symbol) {
            return str[position] === symbol;
        },
        next () {
            return str[position++];
        },
        error (name) {
            throw Error(`ERROR: malformed ${name} at ${position}.`);
        },
        bound (symbol) {
            bounds.push([
                position,
                symbol
            ]);
        },
        unbound () {
            bounds.pop();
        },
        atBound () {
            const { length: length1  } = bounds;
            if (length1 > 0) {
                const [position1, symbol] = bounds[length1 - 1];
                if (input.done()) throw Error(`ERROR: since ${position1} expected "${symbol}" before end of input`);
                return input.at(symbol);
            }
            return input.done();
        }
    };
    return tao(input);
}
function unparse(ast) {
    return ast.tao.reduce((acc, next)=>acc + unparsePart(next)
    , "");
}
function unparsePart(ast) {
    if (isTree(ast)) return '[' + unparse(ast.tree) + ']';
    if (isNote(ast)) return ast.note;
    if (isOp(ast)) return '`' + ast.op;
    throw Error(`Invalid JSON AST of TAO: ${JSON.stringify(ast)}`);
}
function isTree(ast) {
    return !!ast.tree;
}
function isNote(ast) {
    return !!ast.note;
}
function isOp(ast) {
    return !!ast.op;
}
function tao(input) {
    const tao1 = [];
    while(true){
        if (input.atBound()) return {
            tao: tao1
        };
        let part = tree(input);
        if (part === other) {
            part = op(input);
            if (part === other) part = note(input);
        }
        tao1.push(part);
    }
}
function tree(input) {
    if (input.at('[')) {
        input.next();
        input.bound(']');
        const tree1 = tao(input);
        input.unbound();
        input.next();
        return {
            tree: tree1
        };
    }
    return other;
}
function op(input) {
    if (input.at('`')) {
        input.next();
        if (input.done()) input.error('op');
        return {
            op: input.next()
        };
    }
    return other;
}
function note(input) {
    if (meta(input)) input.error('note');
    let note1 = input.next();
    while(true){
        if (meta(input) || input.done()) return {
            note: note1
        };
        note1 += input.next();
    }
}
function meta(input) {
    return input.at('[') || input.at('`') || input.at(']');
}
const firstIndexOf = (tao1, isIt, { startIndex =0  } = {
})=>{
    for(let i = startIndex; i < tao1.length; ++i){
        if (isIt(tao1[i])) return i;
    }
    return undefined;
};
const lastIndexOf = (tao1, isIt, { startIndex =tao1.length - 1  } = {
})=>{
    for(let i = startIndex; i >= 0; --i){
        if (isIt(tao1[i])) return i;
    }
    return undefined;
};
const whitespace = "\n\r\t\v ";
const isVisible = (c)=>!whitespace.includes(c)
;
const isBlankNote = (part)=>{
    return isNote(part) && part.note.trim() === '';
};
const isBlank = (tao1)=>{
    return tao1.length === 0 || tao1.length === 1 && isBlankNote(tao1[0]);
};
const isValidOp = (op1)=>[
        '`',
        '[',
        ']'
    ].includes(op1)
;
const string = (tao1)=>{
    const slices = [];
    for (const part of tao1){
        if (isNote(part)) slices.push(part.note);
        else if (isOp(part) && isValidOp(part.op)) slices.push(part.op);
        else throw Error(`Not allowed in a string: ${JSON.stringify(part)}`);
    }
    return slices.join('');
};
const taos = (tao1)=>{
    const taos1 = [];
    for (const part of tao1){
        if (isTree(part)) taos1.push(part.tree.tao);
        else if (!isBlankNote(part)) throw Error(`Only whitespace allowed inbetween items, got: ${JSON.stringify(part)}.`);
    }
    return taos1;
};
const taoEntries = (tao1)=>{
    const entries = [];
    let startIndex = 0;
    while(true){
        const flat = nextFlat(tao1, startIndex);
        if (flat.isLast) {
            if (isBlank(flat.slice)) return entries;
            else {
                throw Error(`Only whitespace allowed after entries, got: ${JSON.stringify(flat)}`);
            }
        }
        const { entry , nextIndex  } = taoEntry(flat, tao1);
        entries.push(entry);
        startIndex = nextIndex;
    }
};
const nextFlat = (tao1, startIndex = 0)=>{
    const treeIndex = firstIndexOf(tao1, isTree, {
        startIndex
    });
    const slice = tao1.slice(startIndex, treeIndex);
    if (treeIndex === undefined) return {
        isLast: true,
        slice
    };
    const opIndex = firstIndexOf(slice, isOp);
    if (opIndex === undefined) return {
        isNote: true,
        slice,
        treeIndex
    };
    const subslice = slice.slice(0, opIndex);
    if (isBlank(subslice)) return {
        isOp: true,
        slice,
        op: slice[opIndex].op,
        opIndex,
        treeIndex
    };
    return {
        isNoteOp: true,
        slice,
        opIndex,
        treeIndex
    };
};
const taoEntry = (flat, tao1)=>{
    const { key , valueIndex =flat.treeIndex  } = keyPart(flat, tao1);
    const value = taoOfTree(tao1[valueIndex]);
    return {
        entry: [
            key,
            value
        ],
        nextIndex: valueIndex + 1
    };
};
const keyPart = (flat, tao1)=>{
    if (flat.isNote || flat.isNoteOp) return stringKey(flat.slice);
    if (flat.isOp) {
        const { op: op1 , slice  } = flat;
        if (isValidOp(op1)) return stringKey(slice);
        if (op1 === "'") {
            if (isBlank(slice.slice(flat.opIndex + 1))) return paddedKey(tao1, flat.treeIndex);
            else throw Error(`Only whitespace allowed before padded key, got: ${JSON.stringify(slice)}.`);
        }
        if (op1 === '#') return comment(tao1, flat.treeIndex);
    }
    throw Error(`Unrecognized key: ${JSON.stringify(flat)}`);
};
const taoOfTree = (tree1)=>tree1.tree.tao
;
const stringKey = (tao1)=>{
    const meta1 = firstIndexOf(tao1, (p)=>isOp(p) && p.op === ':'
    );
    const str = meta1 === undefined ? string(tao1) : string(tao1.slice(0, meta1));
    const fvi = firstIndexOf(str, isVisible);
    const lvi = lastIndexOf(str, isVisible);
    const key = str.slice(fvi, lvi + 1);
    return {
        key
    };
};
const paddedKey = (tao1, treeIndex)=>{
    const flat = nextFlat(tao1, treeIndex + 1);
    if (flat.isLast) throw Error('Expected value or metadata after padded key');
    if (flat.isOp) {
        if (flat.op !== ':') throw Error(`Not allowed between padded key and value: ${JSON.stringify(flat)}!`);
    } else if (!flat.isNote || !isBlank(flat.slice)) throw Error(`Not allowed between padded key and value: ${JSON.stringify(flat)}!`);
    const key = string(taoOfTree(tao1[treeIndex]));
    return {
        key,
        valueIndex: flat.treeIndex
    };
};
const comment = (tao1, treeIndex)=>{
    const flat = nextFlat(tao1, treeIndex + 1);
    if (flat.isLast) throw Error('Expected key after comment');
    return keyPart(flat, tao1);
};
const parse1 = (str)=>{
    return infer(parse2(str).tao);
};
export { parse1 as parse };
const emptiness = '';
const infer = (tao1)=>{
    if (tao1.length === 0) return emptiness;
    const index = firstIndexOf(tao1, isTree);
    if (index === undefined) return string(tao1);
    const slice = tao1.slice(0, index);
    if (isBlank(slice)) return taos(tao1).map((t)=>infer(t)
    );
    return Object.fromEntries(taoEntries(tao1).map(([k, v])=>[
            k,
            infer(v)
        ]
    ));
};
const stringify1 = (value, { indent =0  } = {
})=>{
    return doStringify(value, {
        indent: indentToString(indent),
        postKey: indent ? ' ' : '',
        prefix: indent ? '\n' : '',
        prevPrefix: ''
    });
};
export { stringify1 as stringify };
const doStringify = (value, opts)=>{
    const { indent , postKey , prefix , prevPrefix  } = opts;
    if (value === undefined) throw Error('oops');
    if (value === null || value === '') return '';
    if (typeof value === 'string') return stringifyJsonString(value);
    if (typeof value === 'boolean' || typeof value === 'number') return '' + value;
    const nextPrefix = prefix + indent;
    if (Array.isArray(value)) {
        if (value.length === 0) return '';
        return value.map((v)=>prefix + '[' + doStringify(v, {
                ...opts,
                prevPrefix: prefix,
                prefix: nextPrefix
            }) + ']'
        ).join('') + prevPrefix;
    }
    if (typeof value === 'object') return Object.entries(value).map(([k, v])=>{
        return prefix + stringifyJsonKey(k) + postKey + '[' + doStringify(v, {
            ...opts,
            prevPrefix: prefix,
            prefix: nextPrefix
        }) + ']';
    }).join('') + prevPrefix;
    throw Error(`Unrecognized value: ${value}`);
};
const stringifyJsonString = (jsonString)=>{
    let ret = '';
    for (const c of jsonString){
        if (isValidOp(c)) ret += '`' + c;
        else ret += c;
    }
    return ret;
};
const stringifyJsonKey = (jsonKey)=>{
    const str = stringifyJsonString(jsonKey);
    const key = str.trim();
    if (key === '' || key !== str) return `\`'[${str}]`;
    return key;
};
const indentToString = (indent)=>{
    if (typeof indent === 'number') return repeatString(' ', indent);
    if (typeof indent === 'string' && firstIndexOf(indent, isVisible) === undefined) return indent;
    throw Error(`Bad indent: ${JSON.stringify(indent)}!`);
};
const repeatString = (str, times)=>{
    let ret = '';
    for(let i = 0; i < times; ++i){
        ret += str;
    }
    return ret;
};
