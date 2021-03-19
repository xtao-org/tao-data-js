// check len 1 in each branch
// means key is [`']
// if (fqi === 0) return {lead: '', keyStr: '', trail: ''}

// todo:
const key = (tao) => {
  const {length} = tao
  const a = firstIndexOf(tao, part => isOp(part) && part.op === "'")

  if (a === undefined) {
    const b = firstIndexOf(tao, part => isOp(part) && part.op === ":")

    if (b === undefined) {
      // unpadded key
      // todo: handle 1-note key pre & post
      // todo: pre & post

      if (length === 1) {    
        const first = tao[0]

        if (isOp(first)) {
          if (isValidOp(first.op)) return 'todo'
          else throw Error('oops')
        }
    
        const {note} = first
        // let lead = '', trail = '', keyStr = note

        const fvi = firstIndexOf(note, isVisible)
        const lvi = lastIndexOf(note, isVisible)
    
        const lead = fvi === undefined? '': note.slice(0, fvi)
        const trail = lvi === undefined? '': note.slice(lvi + 1)
        const keyStr = fvi === undefined? 
          (lvi === undefined? note: note.slice(0, lvi)): 
          (lvi === undefined? note.slice(fvi): note.slice(fvi, lvi))
        
        //note.slice(fvi || 0, (lvi || 0) + 1)
    
        return 'todo' // {lead, keyStr, trail}
      }
    } else {
      if (length === 1) {
        // key is `:
      }

      // only-right-padded key
      const trail = tao.slice(b)
      // todo: left-pre

      const first = tao[0]
      if (isOp(first)) {
        if (first.op === ':') {}
        else if (!isValidOp(first.op)) throw Error('oops')
      } else {
        // first is note
        const {note} = first
        const fvi = firstIndexOf(note, isVisible)
        const lead = fvi === undefined? '': note.slice(0, fvi)
        const keyStr = fvi === undefined? note: note.slice(fvi)

        return 'todo' // {lead, keyStr, trail}
      }
    }
  } else {
    const b = firstIndexOf(tao, part => isOp(part) && part.op === ":")
    if (b === undefined) {
      if (length === 1) {
        // key is `'
      }

      // only-left-padded key
      const lead = tao.slice(0, a)
      // todo: right-post

      const last = tao[length - 1]
      if (isOp(last)) {
        if (last.op === "'") {}
        else if (!isValidOp(last.op)) throw Error('oops')
      } else {
        // last is note
        const {note} = last
        const lvi = lastIndexOf(note, isVisible)
        const trail = lvi === undefined? '': note.slice(lvi + 1)
        const keyStr = lvi === undefined? note: note.slice(0, lvi)

        return 'todo' // {lead, keyStr, trail}
      }
    } else {
      if (length === 2) {
        // key is `'`:
      }

      // left-and-right-padded key
      const lead = tao.slice(0, a)
      const trail = tao.slice(b)
    }
  }
}