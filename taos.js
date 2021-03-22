import {isBlankNote} from './lib.js'
import {isTree} from './deps.js'

export const taos = (tao) => {
  const taos = []
  for (const part of tao) {
    if (isTree(part)) taos.push(part.tree.tao)
    else if (!isBlankNote(part)) throw Error(`Only whitespace allowed inbetween items, got: ${JSON.stringify(part)}.`)
  }
  return taos
}