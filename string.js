import {isValidOp} from './lib.js'
import {isOp, isNote} from './deps.js'

export const string = (tao) => {
  const slices = []
  for (const part of tao) {
    if (isNote(part)) slices.push(part.note)
    else if (isOp(part) && isValidOp(part.op)) slices.push(part.op)
    else throw Error(`Not allowed in a string: ${JSON.stringify(part)}`)
  }
  return slices.join('')
}