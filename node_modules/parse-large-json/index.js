'use strict'

const wait = (time, passon) => new Promise(resolve => setTimeout(() => resolve(passon), time))

module.exports = parseAsync

function parseAsync (string, maxSize, timeout) {
  const result = getValue(string, maxSize, timeout)
  return typeof result.then === 'function'
    ? result
    : Promise.resolve(result)
}

function getValue (string, maxSize, timeout) {
  const { val, rest } = typeCheck(string)
  if (!val || typeof val !== 'object') {
    return { val, rest }
  } else {
    const isArray = val instanceof Array
    const chunk = grabChunk(rest, isArray, maxSize)
    return chunk || new Promise((resolve, reject) => {
      if (isArray) {
        resolve(parseArray(val, rest, maxSize, timeout))
      } else {
        resolve(parseObject(val, rest, maxSize, timeout))
      }
    })
  }
}

const arrayMarkers = [ '[', ']' ]
const objectMarkers = [ '{', '}' ]
const stringMarker = '"'
const escaper = '\\'

function grabChunk (string, isArray, maxSize) {
  const [ opener, closer ] = isArray ? arrayMarkers : objectMarkers
  let depth = 0
  let inString = false
  for (let i = 0; i < maxSize; i++) {
    const lookAt = string[i]
    if (lookAt === escaper) {
      i++
    } else {
      if (inString) {
        if (lookAt === stringMarker) {
          inString = false
        }
      } else {
        switch (lookAt) {
          case opener: depth++; break
          case closer: depth--; break
          case stringMarker: inString = true; break
        }
      }
      if (depth === 0) {
        const cutAt = i + 1
        return {
          val: JSON.parse(string.substr(0, cutAt)),
          rest: string.substr(cutAt)
        }
      }
    }
  }
}

function typeCheck (string) {
  const firstChar = string[0]
  const firstCheck = charToType[firstChar]
  if (firstCheck) {
    return firstCheck(string)
  } else {
    return extractNumber(string)
  }
}

const charToType = {
  '{': (string) => ({val: {}, rest: string}),
  '[': (string) => ({val: [], rest: string}),
  't': (string) => ({val: true, rest: string.substr(4)}),
  'f': (string) => ({val: false, rest: string.substr(5)}),
  'n': (string) => ({val: null, rest: string.substr(4)}),
  '"': (string) => extractString(string)
}

function parseObject (obj, string, maxSize, timeout) {
  const {key, rest} = getKey(string)
  if (key) {
    const value = getValue(rest, maxSize, timeout)
    if (value.then) {
      const queuedHandle = value.then(handle)
      return timeout
        ? queuedHandle.then(result => wait(timeout, result))
        : queuedHandle
    } else {
      return handle(value)
    }
  } else {
    return {val: obj, rest}
  }

  function handle ({val, rest}) {
    obj[key] = val
    if (rest[0] === ',') {
      return parseObject(obj, rest, maxSize, timeout)
    } else {
      return {val: obj, rest: rest.substr(1)}
    }
  }
}

const keyFinder = /"(.*?)":/
function getKey (string) {
  if (string[1] === '}') {
    return {key: null, rest: string.substr(2)}
  } else {
    const matched = string.match(keyFinder)
    if (matched) {
      const key = matched[1]
      return {key, rest: string.substr(2 + key.length + 2)}
    } else {
      throw Error('unable to find key..')
    }
  }
}

function parseArray (arr, string, maxSize, timeout) {
  const value = getValue(string.substr(1), maxSize, timeout)
  if (value.then) {
    const queuedHandle = value.then(handle)
    return timeout
      ? queuedHandle.then(result => wait(timeout, result))
      : queuedHandle
  } else {
    return handle(value)
  }
  function handle ({val, rest}) {
    arr.push(val)
    if (rest[0] === ',') {
      return parseArray(arr, rest, maxSize, timeout)
    } else {
      return {val: arr, rest: rest.substr(1)}
    }
  }
}

const stringFinder = /(".*?[^\\]")[,}\]]/
function extractString (string) {
  const matched = string.match(stringFinder)
  if (matched) {
    const raw = matched[1]
    return {
      val: JSON.parse(raw),
      rest: string.substr(raw.length)
    }
  } else {
    throw Error('unable to extractString..')
  }
}

const numberFinder = /([0-9-.]+)/
function extractNumber (string) {
  const matched = string.match(numberFinder)
  if (matched) {
    const raw = matched[1]
    return {
      val: Number(raw),
      rest: string.substr(raw.length)
    }
  } else {
    throw Error('unable to extractNumber..')
  }
}
