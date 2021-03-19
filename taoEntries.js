import {firstIndexOf, lastIndexOf, isBlank, isValidOp, isVisible} from './lib.js'
import {isTree, isOp} from '../tao-parser-js/src/tao-parser.js'
import {string} from './string.js'

export const taoEntries = (tao) => {
  const entries = []
  let startIndex = 0
  while (true) {
    const slice = nextSlice(tao, startIndex)

    console.log(slice)

    if (slice.last) {
      if (isBlank(slice.last)) return entries
      else {
        console.error('non', slice)
        throw Error('non-blank at the end')
      }
    }

    const {entry, nextIndex} = taoEntry(slice, tao)
    entries.push(entry)
    startIndex = nextIndex 
  }
}

const nextSlice = (tao, startIndex = 0) => {
  const treeIndex = firstIndexOf(tao, isTree, {startIndex})
  const slice = tao.slice(startIndex, treeIndex)

  if (treeIndex === undefined) return {last: slice}

  const opIndex = firstIndexOf(slice, isOp)

  if (opIndex === undefined) return {note: slice, treeIndex}

  const subslice = slice.slice(0, opIndex)

  if (isBlank(subslice)) return {op: slice, opIndex, treeIndex}

  return {noteOp: slice, opIndex, treeIndex}
}

const keyPart = (slice, tao) => {
  // handle single note key: trim both sides; todo: separate noteKey fn
  if (slice.note) return stringKey(slice.note)

  // string key: trim first note left, last note (if any) right
  if (slice.noteOp) return stringKey(slice.noteOp)

  if (slice.op) {
    const s = slice.op
    const op = s[slice.opIndex].op
    if (isValidOp(op)) return stringKey(slice.op)
    if (op === "'") {
      // todo: handle '-keys -- allow space or no?
      // for now allowing
      if (isBlank(s.slice(slice.opIndex + 1))) return paddedKey(tao, slice.treeIndex)
      else throw Error('oops')
    }
    if (op === '#') {
      // todo: handle comments -- allow space or no?
      // for now allowing
      if (isBlank(s.slice(slice.opIndex + 1))) return keyPart(tao, slice.treeIndex + 1) // comment(tao, slice.treeIndex)
      else throw Error('oops')
    }
  }

  throw Error('oops')
}

const taoEntry = (slice, tao) => {
  const {key, valueIndex = slice.treeIndex} = keyPart(slice, tao)
  const value = taoOfTree(tao[valueIndex])

  // console.log('entry', key, value)

  return {entry: [key, value], nextIndex: valueIndex + 1}
}

const stringKey = (tao) => {
  // note: assuming tao is flat and nonblank

  // string key: trim first note left, last note (if any) right
  const str = string(tao)

  // we know str is non-blank at this point so both fvi and lvi will be defined
  const fvi = firstIndexOf(str, isVisible)
  const lvi = lastIndexOf(str, isVisible)

  const key = str.slice(fvi, lvi + 1)

  return {key}
}

const taoOfTree = (tree) => tree.tree.tao

const paddedKey = (tao, treeIndex) => {
  const slice = nextSlice(tao, treeIndex + 1)

  if (slice.last) throw Error('expected value after padded key')
  if (!slice.note || !isBlank(slice.note)) throw Error('only blank allowed between padded key and value!')

  const key = string(taoOfTree(tao[treeIndex]))

  return {key, valueIndex: slice.treeIndex}
}