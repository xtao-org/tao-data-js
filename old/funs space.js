import {parse as parseStr, isOp, isNote, isTree} from '../tao-parser-js/src/tao-parser.js'

const isBlankNote = (part) => {
  return isNote(part) && part.note.trim() === ''
}

const isBlank = (tao) => {
  return tao.length === 0 || (tao.length === 1 && isBlankNote(tao[0]))
}

const isValidOp = (op) => ['`', '[', ']'].includes(op)

// todo: or empty string
const theEmptiness = []

// tao.jsonParse, tao.jsonStringify

const jsonStringStringify = (jsonString) => {
  let ret = ''
  for (const c of jsonString) {
    if (isValidOp(c)) ret += '`' + c
    else ret += c
  }
  return ret
}

// todo: handle empty key, padded keys
const jsonKeyStringify = (jsonKey) => {
  const str = jsonStringStringify(jsonKey)
  const key = str.trim()
  if (key === '' || key !== str) throw Error('not implemented')
  return key
}

export const jsonStringify = (json) => {
  if (json === undefined) throw Error('oops')
  if (json === null || json === '') return ''
  if (typeof json === 'string') return jsonStringStringify(json)
  if (typeof json === 'boolean' || typeof json === 'number') return '' + json
  if (Array.isArray(json)) {
    if (json.length === 0) return ''
    return json.map(v => '[' + jsonStringify(v) + ']').join('')
  }
  // assuming object
  return Object.entries(json).map(([k, v]) => {
    return jsonKeyStringify(k) + '[' + jsonStringify(v) + ']'
  }).join('')
}

const funs = {
  // todo: alias 'json' or 'value'?
  // todo: option to infer booleans, numbers, nulls, whathaveyou; could be via provided fns
  infer: (tao, {primitives = [], emptiness = theEmptiness} = {}) => {
    if (tao.length === 0) return emptiness
    const index = funs.firstIndexOfTree(tao)
    if (index === undefined) return funs.string(tao)
    const slice = tao.slice(0, index)
    if (isBlank(slice)) return funs.taos(tao).map(t => funs.infer(t))
    return Object.fromEntries(funs.taoEntries(tao).map(([k, v]) => [k, funs.infer(v)]))
  },
  empty: (tao, emptiness = theEmptiness) => {
    if (tao.length === 0) return emptiness
    throw Error(`tao ${JSON.stringify(tao)} is not empty!`)
  },
  // ?todo: error on empty tao?
  taos: (tao) => {
    const taos = []
    for (const part of tao) {
      if (isTree(part)) taos.push(part.tree.tao)
      else if (!isBlankNote(part)) throw Error(`Only whitespace is allowed inbetween items. Not allowed: ${JSON.stringify(part)}.`)
    }
    return taos
  },
  // ?todo: error on empty tao?
  taoEntries: (tao) => {
    const entries = []
    let i = 0
    while (true) {
      let treeIndex = funs.firstIndexOfTree(tao, i)
      const slice = tao.slice(i, treeIndex)
      if (treeIndex === undefined) {
        if (isBlank(slice)) return entries
        else throw Error(`Only whitespace is allowed after entries. Not allowed: ${JSON.stringify(slice)}`)
      }
      // todo: use space
      const {padded, preSpace, key: k, postSpace} = funs.key(slice)

      let key
      if (padded) {
        key = funs.string(tao[treeIndex].tree.tao)
        i = treeIndex + 1
        treeIndex = funs.firstIndexOfTree(tao, i)
        if (treeIndex === undefined) throw Error('oops')
        const slice = tao.slice(i, treeIndex)
        if (!isBlank(slice)) throw Error('oops')
        // todo: slice is postSpace
      } else {
        key = k
      }

      const value = tao[treeIndex].tree.tao
      entries.push([key, value])
      i = treeIndex + 1
    }
  },
  firstIndexOfTree: (tao, startIndex = 0) => {
    for (let i = startIndex; i < tao.length; ++i) {
      if (isTree(tao[i])) return i
    }
    return undefined
  },
  key: (tao) => {
    const {length} = tao
    if (isBlank(tao)) throw Error(`Blank key ${JSON.stringify(tao)}!`)
  
    const last = tao[length - 1]
    if (isOp(last) && last.op === "'") {
      if (length > 2) throw Error('oops')
      else if (length === 2) {
        const first = tao[0]
        if (!isBlankNote(first)) throw Error('oops')
        return {padded: true, preSpace: first.note}
      }
      return {padded: true}
    }
  
    const str = funs.string(tao)
    
    // we know key is non-blank at this point so both fvi and lvi will be defined
    const fvi = firstIndexOf(str, isVisible)
    const lvi = lastIndexOf(str, isVisible)

    const preSpace = str.slice(0, fvi)
    const postSpace = str.slice(lvi + 1)
    const key = str.slice(fvi, lvi + 1)

    return {preSpace, key, postSpace}
  },
  keyOld: (tao) => {
    // for now returning a string
    // todo: proper keys with comments and padding
    if (isBlank(tao)) throw Error(`Blank key ${JSON.stringify(tao)}!`)
    return funs.string(tao).trim()
  },
  // todo: number, boolean, ?null, whathaveyou + configurable infer
  string: (tao) => {
    const slices = []
    for (const part of tao) {
      if (isNote(part)) slices.push(part.note)
      else if (isOp(part) && isValidOp(part.op)) slices.push(part.op)
      else throw Error(`Not allowed in a string: ${JSON.stringify(part)}`)
    }
    return slices.join('')
  },
  // ?todo: add a JSON type? 1. unparse TAO, parse as JSON
  // todo: stricter parsing (JSON.parse?), numbers
  number: (tao) => {
    return +funs.string(tao)
  },
  boolean: (tao) => {
    const str = funs.string(tao)
    if (str === 'true') return true
    if (str === 'false') return false
    throw Error(`Not a boolean: ${str}`)
  },
  null: (tao) => {
    const str = funs.string(tao)
    if (str === 'null') return null
    throw Error(`Not a null: ${str}`)
  },
  strings: (tao) => {
    const strings = []
    for (const t of funs.taos(tao)) {
      strings.push(funs.string(t))
    }
    return strings
  }
}

export const parse = Object.fromEntries(Object.entries(funs).map(([key, fun]) => {
  const wrapper = (str) => {
    return fun(parseStr(str).tao)
  }

  return [key, wrapper]
}))

export const jsonParse = parse.infer

const firstIndexOf = (tao, fn = isTree, startIndex = 0) => {
  for (let i = startIndex; i < tao.length; ++i) {
    if (fn(tao[i])) return i
  }
  return undefined
}
const lastIndexOf = (tao, fn = isTree, startIndex = tao.length - 1) => {
  for (let i = startIndex; i >= 0; --i) {
    if (fn(tao[i])) return i
  }
  return undefined
}

const whitespace = "\n\r\t\v "
const isVisible = (c) => !whitespace.includes(c)