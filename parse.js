import {parse as parseStr, isTree} from './deps.js'
import {firstIndexOf, isBlank} from './lib.js'
import {string} from './string.js'
import {taos} from './taos.js'
import {taoEntries} from './taoEntries.js'

export const parse = (str) => {
  return infer(parseStr(str).tao)
}

const emptiness = ''
const infer = (tao) => {
  if (tao.length === 0) return emptiness

  const index = firstIndexOf(tao, isTree)
  if (index === undefined) return string(tao)

  const slice = tao.slice(0, index)
  if (isBlank(slice)) return taos(tao).map(t => infer(t))
  
  return Object.fromEntries(taoEntries(tao).map(([k, v]) => [k, infer(v)]))
}