# TAO data module for JavaScript

This is a [TAO data](https://www.tree-annotation.org/#data) module for JavaScript. It provides two functions: `parse` and `stringify`. They are analogous to [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) and [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) and can be used to serialize and deserialize data to and from TAO in the same way as JSON.

## Usage

Same as [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) and [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for the one-argument case:

```js
import * as TaoData from 'https://cdn.jsdelivr.net/gh/tree-annotation/tao-data-js@v1-2021-03-22-beta/bundle.js'

const dataStr = TaoData.stringify({foo: "bar", baz: "quux"})
const data = TaoData.parse(dataStr)

console.log(dataStr) // foo[bar]baz[quux]
console.log(data) // { foo: "bar", baz: "quux" }
```

To stringify with pretty printing:

```js
import * as TaoData from 'https://cdn.jsdelivr.net/gh/tree-annotation/tao-data-js@v1-2021-03-22-beta/bundle.js'

const dataStr = TaoData.stringify({foo: {baz: "quux"}}, {indent: 2})

console.log(dataStr) /*

foo [
  baz [quux]
]
*/
```

## Skipped entries, metadata, padded keys

The notation supports skipped entries (which can be used as comments), metadata (currently ignored, so also serves as comments), and padded keys:

```
regular key [with a value]

`# skipped key [skipped value]

another key`: with metadata [and a value]

`'[ padded key ] [and its value]
```

Parses to the following JSON:

```
{
  "regular key": "with a value",
  "another key": "and a value",
  " padded key ": "and its value"
}
```

## Example configuration file

The following excerpt from [the default Visual Studio Code configuration file](https://code.visualstudio.com/docs/getstarted/settings#_default-settings) written in JSONC (JSON with comments) :

```
{
  // Controls whether the editor shows CodeLens.
  "diffEditor.codeLens": false,

  // When enabled, the diff editor ignores changes in leading or trailing whitespace.
  "diffEditor.ignoreTrimWhitespace": true,

  // Timeout in milliseconds after which diff computation is cancelled. Use 0 for no timeout.
  "diffEditor.maxComputationTime": 5000,

  // Controls whether the diff editor shows +/- indicators for added/removed changes.
  "diffEditor.renderIndicators": true,

  // Controls whether the diff editor shows the diff side by side or inline.
  "diffEditor.renderSideBySide": true,

  //  - off: Lines will never wrap.
  //  - on: Lines will wrap at the viewport width.
  //  - inherit: Lines will wrap according to the `editor.wordWrap` setting.
  "diffEditor.wordWrap": "inherit"
}
```

can be represented in TAO data as:

```
Diff Editor [

  Code Lens`:
    Controls whether the editor shows CodeLens.
  [false]


  Ignore Trim Whitespace`:
    When enabled, the diff editor ignores changes in leading or trailing whitespace.
  [true]


  Max Computation Time`:
    Timeout in milliseconds after which diff computation is cancelled. Use 0 for no timeout.
  [5000]


  Render Indicators`:
    Controls whether the diff editor shows +/- indicators for added/removed changes.
  [true]


  Render Side By Side`:
    Controls whether the diff editor shows the diff side by side or inline.
  [true]
  

  Word Wrap`:
    - off: Lines will never wrap.
    - on: Lines will wrap at the viewport width.
    - inherit: Lines will wrap according to the 'editor.wordWrap' setting.
  [inherit]

]
```

This would parse to the following JSON:

```
{
  "Diff Editor": {
    "Code Lens": "false",
    "Ignore Trim Whitespace": "true",
    "Max Computation Time": "5000",
    "Render Indicators": "true",
    "Render Side By Side": "true",
    "Word Wrap": "inherit"
  }
}
```