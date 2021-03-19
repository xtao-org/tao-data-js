export const mappings = [
  [`a[b]c[d]e[f]`, { a: "b", c: "d", e: "f" }],
  [`[a][b][c]`, [ "a", "b", "c" ]],
  ['hello `[world`] of ``', "hello [world] of `"],
  ['hey `[ho`] [let\'s[go]] and [[1][2][3]]', { "hey [ho]": { "let's": "go" }, and: [ "1", "2", "3" ] }],
  ['`\'[ hey `[ho`] ] [let\'s[go]] `\'[][empty]', { " hey [ho] ": { "let's": "go" }, "": "empty" }],
]