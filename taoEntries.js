import {firstIndexOf, lastIndexOf, isBlank, isValidOp, isVisible} from './lib.js'
import {isTree, isOp} from './deps.js'
import {string} from './string.js'

export const taoEntries = (tao) => {
  const entries = []
  let startIndex = 0
  while (true) {
    const flat = nextFlat(tao, startIndex)

    if (flat.isLast) {
      if (isBlank(flat.slice)) return entries
      else {
        throw Error(`Only whitespace allowed after entries, got: ${JSON.stringify(flat)}`)
      }
    }

    const {entry, nextIndex} = taoEntry(flat, tao)
    entries.push(entry)
    startIndex = nextIndex 
  }
}

const nextFlat = (tao, startIndex = 0) => {
  const treeIndex = firstIndexOf(tao, isTree, {startIndex})
  const slice = tao.slice(startIndex, treeIndex)
  if (treeIndex === undefined) return {isLast: true, slice}

  const opIndex = firstIndexOf(slice, isOp)
  if (opIndex === undefined) return {isNote: true, slice, treeIndex}

  const subslice = slice.slice(0, opIndex)
  if (isBlank(subslice)) return {isOp: true, slice, op: slice[opIndex].op, opIndex, treeIndex}

  return {isNoteOp: true, slice, opIndex, treeIndex}
}

const keyPart = (flat, tao) => {
  // handle single note key: trim both sides; todo: separate noteKey fn
  if (flat.isNote) return stringKey(flat.slice)

  // string key: trim first note left, last note (if any) right
  if (flat.isNoteOp) return stringKey(flat.slice)

  if (flat.isOp) {
    const {op, slice} = flat
    if (isValidOp(op)) return stringKey(slice)

    if (op === "'") {
      // ?todo move the if-else into paddedKey
      if (isBlank(slice.slice(flat.opIndex + 1))) return paddedKey(tao, flat.treeIndex)
      else throw Error(`Only whitespace allowed before padded key, got: ${JSON.stringify(slice)}.`)
    }

    // todo: perhaps check if comment 'key' is a valid key
    if (op === '#') return comment(tao, flat.treeIndex)
  }

  throw Error(`Unrecognized key: ${JSON.stringify(flat)}`)
}

const taoEntry = (flat, tao) => {
  const {key, valueIndex = flat.treeIndex} = keyPart(flat, tao)
  const value = taoOfTree(tao[valueIndex])

  return {entry: [key, value], nextIndex: valueIndex + 1}
}

const stringKey = (tao) => {
  // note: assuming tao is flat and nonblank
  const meta = firstIndexOf(tao, p => isOp(p) && p.op === ':')

  // string key: trim first note left, last note (if any) right
  const str = meta === undefined? string(tao): string(tao.slice(0, meta))

  // we know str is non-blank at this point so both fvi and lvi will be defined
  const fvi = firstIndexOf(str, isVisible)
  const lvi = lastIndexOf(str, isVisible)

  const key = str.slice(fvi, lvi + 1)

  return {key}
}

const taoOfTree = (tree) => tree.tree.tao

const paddedKey = (tao, treeIndex) => {
  const flat = nextFlat(tao, treeIndex + 1)

  if (flat.isLast) throw Error('Expected value or metadata after padded key')

  if (flat.isOp) {
    // note ignore meta for now
    if (flat.op !== ':') throw Error(`Not allowed between padded key and value: ${JSON.stringify(flat)}!`)
  } else if (!flat.isNote || !isBlank(flat.slice)) throw Error(`Not allowed between padded key and value: ${JSON.stringify(flat)}!`)

  const key = string(taoOfTree(tao[treeIndex]))

  return {key, valueIndex: flat.treeIndex}
}

const comment = (tao, treeIndex) => {
  const flat = nextFlat(tao, treeIndex + 1)
  if (flat.isLast) throw Error('Expected key after comment')
  return keyPart(flat, tao)
}