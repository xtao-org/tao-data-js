export const mappings = [
  [`a[b] c[d] e[f]`, { a: "b", c: "d", e: "f" }],
  [`[a][b][c]`, [ "a", "b", "c" ]],
  ['hello `[world`] of ``', "hello [world] of `"],
  ['hey `[ho`] [let\'s[go]] and [[1][2][3]]', { "hey [ho]": { "let's": "go" }, and: [ "1", "2", "3" ] }],
  ['`\'[ hey `[ho`] ] [let\'s[go]] `\'[][empty]', { " hey [ho] ": { "let's": "go" }, "": "empty" }],
  [
    `
    first name [John]
    last name [Smith]
    is alive [true]
    age [27]
    address [
      street address [21 2nd Street]
      city [New York]
      state [NY]
      postal code [10021-3100]
    ]
    phone numbers [
      [
        type [home]
        number [212 555-1234]
      ]
      [
        type [office]
        number [646 555-4567]
      ]
    ]
    children []
    spouse [] 
    `,
    { 
      "first name": "John",
      "last name": "Smith",
      "is alive": "true",
      "age": "27",
      "address": {
        "street address": "21 2nd Street",
        "city": "New York",
        "state": "NY",
        "postal code": "10021-3100"
      },
      "phone numbers": [
        {
          "type": "home",
          "number": "212 555-1234"
        },
        {
          "type": "office",
          "number": "646 555-4567"
        }
      ],
      "children": "",
      "spouse": "" 
    }
  ],
  [
    `
    \`# k\`[\`] [comment]
    \`# i [comment2]
    a quirky object \`: meta [
      \`#[nope]
      \`'[  \`[ \`] \`\`  ] \`: meta\`[meta\`] meta [
        this is a value of a key 
        which contains only special characters 
        and is padded with spaces on both sides
      ] 
      \`#[nope]
      \`'[  this key is left-padded] [
        its value contains all possible special characters: 
        \`[\`\`\`]
      ]
      \`'[a right-padded key  ] [  and its value  ]
      \`'[] [a value of an empty key]
      a compact list of lists [
        [[a][b][c]]
        [[d][e][f]]
        [[g][h][i]]
      ]
      emptiness []
    ]
    `,
    {
      "a quirky object": {
        "  [ ] `  ": `
        this is a value of a key 
        which contains only special characters 
        and is padded with spaces on both sides
      `,
        "  this key is left-padded": `
        its value contains all possible special characters: 
        [\`]
      `,
        "a right-padded key  ": "  and its value  ",
        "": "a value of an empty key",
        "a compact list of lists": [
          ["a","b","c"],
          ["d","e","f"],
          ["g","h","i"],
        ],
        "emptiness": ""
      }
    }
  ],
  [
    // excerpt from https://code.visualstudio.com/docs/getstarted/settings#_default-settings
    `
    Diff Editor [

      CodeLens\`:
        Controls whether the editor shows CodeLens.
      [false]
    
    
      Ignore Trim Whitespace\`:
        When enabled, the diff editor ignores changes in leading or trailing whitespace.
      [true]
    
    
      Max Computation Time\`:
        Timeout in milliseconds after which diff computation is cancelled. Use 0 for no timeout.
      [5000]
    
    
      Render Indicators\`:
        Controls whether the diff editor shows +/- indicators for added/removed changes.
      [true]
    
    
      Render Side By Side\`:
        Controls whether the diff editor shows the diff side by side or inline.
      [true]
      
    
      Word Wrap\`:
        - off: Lines will never wrap.
        - on: Lines will wrap at the viewport width.
        - inherit: Lines will wrap according to the 'editor.wordWrap' setting.
      [inherit]
    
    ]
    `,
    {
      "Diff Editor": {
        "CodeLens": "false",
        "Ignore Trim Whitespace": "true",
        "Max Computation Time": "5000",
        "Render Indicators": "true",
        "Render Side By Side": "true",
        "Word Wrap": "inherit"
      }
    }
  ]
]