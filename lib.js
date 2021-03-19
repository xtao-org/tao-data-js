import {isNote} from './deps.js'

export const firstIndexOf = (tao, fn, {startIndex = 0} = {}) => {
  for (let i = startIndex; i < tao.length; ++i) {
    if (fn(tao[i])) return i
  }
  return undefined
}
export const lastIndexOf = (tao, fn, {startIndex = tao.length - 1} = {}) => {
  for (let i = startIndex; i >= 0; --i) {
    if (fn(tao[i])) return i
  }
  return undefined
}

const whitespace = "\n\r\t\v "
export const isVisible = (c) => !whitespace.includes(c)

export const isBlankNote = (part) => {
  return isNote(part) && part.note.trim() === ''
}

export const isBlank = (tao) => {
  return tao.length === 0 || (tao.length === 1 && isBlankNote(tao[0]))
}

export const isValidOp = (op) => ['`', '[', ']'].includes(op)