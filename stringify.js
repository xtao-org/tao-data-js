import {isValidOp} from './lib.js'

export const stringify = (json) => {
  if (json === undefined) throw Error('oops')
  if (json === null || json === '') return ''
  if (typeof json === 'string') return stringifyJsonString(json)
  if (typeof json === 'boolean' || typeof json === 'number') return '' + json
  if (Array.isArray(json)) {
    if (json.length === 0) return ''
    return json.map(v => '[' + stringify(v) + ']').join('')
  }
  // assuming object
  return Object.entries(json).map(([k, v]) => {
    return stringifyJsonKey(k) + '[' + stringify(v) + ']'
  }).join('')
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