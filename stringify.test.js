import {mappings} from './testData.js'
import {stringify} from './stringify.js'
import {parse} from './parse.js'

const jstr = JSON.stringify

Deno.test({
  name: 'stringify returns TAO strings that parse to valid JSON',
  fn: () => {
    for (const [e, i] of mappings) {
      const ret = stringify(i, {indent: 2})

      console.log(ret)
      // console.log(jstr(i, null, 2))
  
      console.assert(jstr(parse(e)) === jstr(parse(ret)), e, ret, jstr(parse(e)), jstr(parse(ret)))
      console.assert(jstr(i) === jstr(parse(ret)), e, ret, jstr(i))
    }
  }
})