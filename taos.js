import {isBlankNote} from './lib.js'
import {isTree} from './deps.js'

// ?todo: error on empty tao?
export const taos = (tao) => {
  const taos = []
  for (const part of tao) {
    if (isTree(part)) taos.push(part.tree.tao)
    else if (!isBlankNote(part)) throw Error(`Only whitespace is allowed inbetween items. Not allowed: ${JSON.stringify(part)}.`)
  }
  return taos
}