# Parse large JSON

Parse JSON in chunks so that weak devices can still function. e.g. allow mobile phones to load decently sized JSON objects without blocking user interaction.

## Install

#### npm
```
npm i parse-large-json --save
```

#### yarn
```
yarn add parse-large-json
```

## Usage

```JavaScript
const parse = require('parse-large-json')

const hugeJSONstring = '{"big":true}' // no whitespaces allowed!
const maxChunkSize = 100e3 

parse(hugeJSONstring, maxChunkSize).then(({val, rest}) => {
  if (rest) {
    throw Error('wicked string?')
  }
  console.log('parsed it!', val)
})

```

## Workings

`parse-large-json` works by looking ahead in the string up to `maxChunkSize`, and determining if the first thing it sees there is an Object it can parse synchronously using `JSON.parse`. If this is not the case, it starts reading the string, parsing "primitives" synchronously, but passing any Object handling to the next tick using a Promise.

This way, the user can control the balance between 
- large amount of small chunks (less blockage, more promises, more time)
- small amount of large chunks (more blocakge, less promises, less time)

