import {isValidOp, firstIndexOf, isVisible} from './lib.js'

export const stringify = (value, {indent = 0} = {}) => {
  return doStringify(value, {
    indent: indentToString(indent), 
    postKey: indent? ' ': '',
    prefix: indent? '\n': '',
    prevPrefix: '',
  })
}

const doStringify = (value, opts) => {
  const {indent, postKey, prefix, prevPrefix} = opts

  if (value === undefined) throw Error('oops')
  if (value === null || value === '') return ''
  if (typeof value === 'string') return stringifyJsonString(value)
  if (typeof value === 'boolean' || typeof value === 'number') return '' + value

  const nextPrefix = prefix + indent
  if (Array.isArray(value)) {
    if (value.length === 0) return ''
    return value.map(v => 
      prefix + '[' + 
        doStringify(v, {...opts, prevPrefix: prefix, prefix: nextPrefix}) + 
      ']'
    ).join('') + prevPrefix
  }

  if (typeof value === 'object') return Object.entries(value).map(([k, v]) => {
    return prefix + stringifyJsonKey(k) + postKey + '[' + 
      doStringify(v, {...opts, prevPrefix: prefix, prefix: nextPrefix}) + 
    ']'
  }).join('') + prevPrefix

  throw Error(`Unrecognized value: ${value}`)
}


const stringifyJsonString = (jsonString) => {
  let ret = ''
  for (const c of jsonString) {
    if (isValidOp(c)) ret += '`' + c
    else ret += c
  }
  return ret
}

const stringifyJsonKey = (jsonKey) => {
  const str = stringifyJsonString(jsonKey)
  const key = str.trim()
  if (key === '' || key !== str) return `\`'[${str}]`
  return key
}

const indentToString = (indent) => {
  if (typeof indent === 'number') return repeatString(' ', indent)
  if (typeof indent === 'string' && firstIndexOf(indent, isVisible) === undefined) return indent
  throw Error(`Bad indent: ${JSON.stringify(indent)}!`)
}

const repeatString = (str, times) => {
  let ret = ''
  for (let i = 0; i < times; ++i) {
    ret += str
  }
  return ret
}