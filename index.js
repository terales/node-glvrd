'use strict'

const request = require('request-promise-native')
const _async = require('asyncawait/async')
const _await = require('asyncawait/await')

const endpointsSpec = require('./endpointsSpec')

function nodeGlvrd (appName) {
  if (typeof appName !== 'string' || !appName.length) {
    throw new Error(`appName is required and should be a string. Got ${typeof appName} ${appName}`)
  }

  this.params = {
    app: appName,
    maxTextLength: 10000,
    maxHintsCount: 25
  }

  this.hintsCache = {}

  this.req = request.defaults({
    baseUrl: endpointsSpec.baseUrl,
    timeout: 1600
  })
}

nodeGlvrd.prototype.checkStatus = _async(function checkStatus () {
  let response = _await(this._makeRequest('getStatus'))

  this.params.maxTextLength = response['max_text_length']
  this.params.maxHintsCount = response['max_hints_count']

  return response
})

nodeGlvrd.prototype.proofread = _async(function proofread (text, callback) {
  try {
    let fragmentsWithoutHints = _await(this._makeRequest('postProofread', 'text=' + text))
    let fragmentsWithHints = fragmentsWithoutHints.fragments.length
      ? _await(this._fillRawFragmentsWithHints(fragmentsWithoutHints.fragments))
      : []

    if (!callback) return fragmentsWithHints
    callback(null, fragmentsWithHints)
  } catch (err) {
    if (!callback) throw new Error(err)
    callback(err, null)
  }
})

nodeGlvrd.prototype._fillRawFragmentsWithHints = _async(function _fillRawFragmentsWithHints (rawFragments) {
  // Check which hints already chached
  let uncachedHints = []
  rawFragments.forEach(fragment => this.hintsCache.hasOwnProperty(fragment.hint_id) ? false : uncachedHints.push(fragment.hint_id))

  // Early return if all our hints are cached
  if (uncachedHints.length === 0) {
    return _await(this._fillFragmentsWithHintFromCache(rawFragments))
  }

  // Remove duplicate hints
  let uncachedHintIds = {}
  uncachedHints.forEach(hintId => { uncachedHintIds[hintId] = null })

  // Query for uncached hints by chanks -- amount of hints in a singl request is limited
  let hintRequests = []
  this._chunkArray(Object.keys(uncachedHintIds), this.params.maxHintsCount)
    .forEach(uncachedHintIdsChunk =>
      hintRequests.push(this._makeRequest('postHints', 'ids=' + uncachedHintIdsChunk.join(',')))
    )

  let hintResposes = _await(Promise.all(hintRequests))

  // Fill cache with new hints
  let hints = []
  hintResposes.forEach(response => hints.concat(response.hints))
  Object.assign(this.hintsCache, hints)

  return this._fillFragmentsWithHintFromCache(rawFragments)
})

nodeGlvrd.prototype._fillFragmentsWithHintFromCache = function _fillFragmentsWithHintFromCache (fragments) {
  return fragments.splice().map(fragment => {
    let { name, description } = this.hintsCache[fragment.hint_id]

    fragment.hint = {
      id: fragment.hint_id,
      name: name,
      description: description
    }

    delete fragment.hint_id
    return fragment
  })
}

nodeGlvrd.prototype._makeRequest = _async(function _makeRequest (endpointKey, body, isJson = true) {
  let endpoint = endpointsSpec.endpoints[endpointKey]
  let weNeedSessionForRequest = endpoint.queryParams.includes('session')

  if (weNeedSessionForRequest) {
    _await(this._checkSessionBeforeRequest())
  }

  // Prepare request
  let queryParams = this._fillQueryParams(endpoint.queryParams)
  let options = {
    method: endpoint.method,
    uri: endpoint.name,
    qs: queryParams,
    json: isJson
  }

  if (body) {
    options.body = body
  }

  // Make request
  let responseBody = _await(this.req(options))

  // Check request response
  if (responseBody.status && responseBody.status === 'error') {
    if (responseBody.code === endpointsSpec.errorsForCover.bad_session.code) {
      // Try to update session and repeat request silently
      _await(this._createSession())
      responseBody = _await(this.req(options))
    } else {
      throw responseBody
    }
  }

  if (endpoint.method === 'post') {
    this._extendSession() // Every POST request extends session
  }

  return responseBody
})

nodeGlvrd.prototype._checkSessionBeforeRequest = _async(function _checkSessionBeforeRequest () {
  let isSessionValid = this.params.sessionValidUntil > (Date.now() + 1000)

  if (this.params.session && isSessionValid) {
    return
  }

  _await(this._createSession())
})

nodeGlvrd.prototype._fillQueryParams = function _fillQueryParams (endpointQueryParams) {
  let queryParams = {}

  endpointQueryParams.forEach(queryParamName => {
    if (this.params.hasOwnProperty(queryParamName)) {
      queryParams[queryParamName] = this.params[queryParamName]
    }
  })

  return queryParams
}

nodeGlvrd.prototype._createSession = _async(function _createSession () {
  let response = _await(this._makeRequest('postSession'))
  this._resetSessionParams(response.session, response.lifespan)
})

nodeGlvrd.prototype._updateSession = _async(function _updateSession () {
  _await(this._makeRequest('postStatus'))
  this._extendSession()
})

nodeGlvrd.prototype._extendSession = function _extendSession () {
  this._resetSessionParams(this.params.session, this.params.sessionLifespan)
}

nodeGlvrd.prototype._resetSessionParams = function _resetSessionParams (session, lifespan) {
  if (session !== this.params.session) {
    this.hintsCache = {}
  }

  this.params.session = session
  this.params.sessionLifespan = lifespan
  this.params.sessionValidUntil = Date.now() + lifespan * 1000
}

nodeGlvrd.prototype._chunkArray = function _chunkArray (arr, len) {
  let chunks = []
  let i = 0
  let n = arr.length

  while (i < n) {
    chunks.push(arr.slice(i, i += len))
  }

  return chunks
}

module.exports = nodeGlvrd
