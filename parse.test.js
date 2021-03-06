import {parse} from './parse.js'
import {mappings} from './testData.js'

const jstr = JSON.stringify

Deno.test({
  name: 'parse returns valid JSON',
  fn: () => {
    for (const [i, e] of mappings) {
      const ret = parse(i)
      console.assert(jstr(e) === jstr(ret), e, ret)
    }
  }
})