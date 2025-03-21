'use strict'

const {
  REUSED_SEARCH_PARAMS,
  REUSED_SEARCH_PARAMS_KEY,
  REUSED_SEARCH_PARAMS_OFFSET
} = require('./constants')
const { isObject } = require('./objects')
const { isNonEmptyString } = require('./strings')

const { encodeURIComponent: encodeComponent } = globalThis

function encodeName(name) {
  return isNonEmptyString(name)
    ? encodeComponent(name).replace(/%3A/g, ':')
    : ''
}

function encodeNamespace(namespace) {
  return isNonEmptyString(namespace)
    ? encodeComponent(namespace).replace(/%3A/g, ':').replace(/%2F/g, '/')
    : ''
}

function encodeQualifierParam(param) {
  if (isNonEmptyString(param)) {
    // Param key and value are encoded with `percentEncodeSet` of
    // 'application/x-www-form-urlencoded' and `spaceAsPlus` of `true`.
    // https://url.spec.whatwg.org/#urlencoded-serializing
    REUSED_SEARCH_PARAMS.set(REUSED_SEARCH_PARAMS_KEY, param)
    return replacePlusSignWithPercentEncodedSpace(
      REUSED_SEARCH_PARAMS.toString().slice(REUSED_SEARCH_PARAMS_OFFSET)
    )
  }
  return ''
}

function encodeQualifiers(qualifiers) {
  if (isObject(qualifiers)) {
    // Sort this list of qualifier strings lexicographically.
    const qualifiersKeys = Object.keys(qualifiers).sort()
    const searchParams = new URLSearchParams()
    for (let i = 0, { length } = qualifiersKeys; i < length; i += 1) {
      const key = qualifiersKeys[i]
      searchParams.set(key, qualifiers[key])
    }
    return replacePlusSignWithPercentEncodedSpace(searchParams.toString())
  }
  return ''
}

function encodeSubpath(subpath) {
  return isNonEmptyString(subpath)
    ? encodeComponent(subpath).replace(/%2F/g, '/')
    : ''
}

function encodeVersion(version) {
  return isNonEmptyString(version)
    ? encodeComponent(version).replace(/%3A/g, ':').replace(/%2B/g, '+')
    : ''
}

function replacePlusSignWithPercentEncodedSpace(str) {
  // Convert plus signs to %20 for better portability.
  return str.replace(/\+/g, '%20')
}

module.exports = {
  encodeComponent,
  encodeName,
  encodeNamespace,
  encodeVersion,
  encodeQualifiers,
  encodeQualifierParam,
  encodeSubpath
}
