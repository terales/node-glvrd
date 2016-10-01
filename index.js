'use strict'

const request = require('request-promise-native')
const async = require('asyncawait/async')
const await = require('asyncawait/await')

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
    timeout: 1000
  })

  // this.checkStatus() // TODO Prepare tests for such update
}

nodeGlvrd.prototype.checkStatus = async(function () {
  let response = await (this._makeRequest('getStatus'))

  this.params.maxTextLength = response['max_text_length']
  this.params.maxHintsCount = response['max_hints_count']

  return response
})

nodeGlvrd.prototype.proofread = function (text) {
  return new Promise((resolve, reject) => {
    this._makeRequest('postProofread', 'text=' + text)
      .then(rawFragments => this._fillRawFragmentsWithHints(rawFragments.fragments))
      .then(filledFragments => resolve(filledFragments))
      .catch(error => {
        console.log('proofread throw')
        reject(error)
      })
  })
}

nodeGlvrd.prototype._fillRawFragmentsWithHints = function (rawFragments) {
  var uncachedHints = []

  rawFragments.forEach(fragment => this.hintsCache.hasOwnProperty(fragment.hint_id) ? false : uncachedHints.push(fragment.hint_id))

  return new Promise(resolve => {
    if (uncachedHints.length === 0) {
      return resolve(this._fillFragmentsWithHintFromCache(rawFragments))
    }

    let uncachedHintIds = {}
    uncachedHints.forEach(hintId => { uncachedHintIds[hintId] = null })

    let hintRequests = []
    this._chunkArray(Object.keys(uncachedHintIds), this.params.maxHintsCount).forEach(uncachedHintIdsChunk => {
      hintRequests.push(this._makeRequest('postHints', 'ids=' + uncachedHintIdsChunk.join(',')))
    })

    Promise.all(hintRequests)
      .then(responses => {
        let hints = []
        responses.forEach(response => hints.concat(response.hints))
        Object.assign(this.hintsCache, hints)
        resolve(this._fillFragmentsWithHintFromCache(rawFragments))
      })
  })
}

nodeGlvrd.prototype._fillFragmentsWithHintFromCache = function (fragments) {
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

nodeGlvrd.prototype._makeRequest = function (endpointKey, body, isJson = true) {
  var endpoint = endpointsSpec.endpoints[endpointKey]

  return new Promise((resolve, reject) => {
    if (endpoint.queryParams.indexOf('session') === -1) {
      return resolve()
    }

    this._checkSessionBeforeRequest()
        .then(() => resolve())
        .catch(error => {
          console.log('after _checkSessionBeforeRequest throw')
          reject(error)
        })
  })
    .then(() => this._fillQueryParams(endpoint.queryParams))
    .then(queryParams => {
      let options = {
        method: endpoint.method,
        uri: endpoint.name,
        qs: queryParams,
        json: isJson
      }

      if (body) {
        options.body = body
      }

      return this.req(options)
    })
    .then(responseBody => {
      if (responseBody.hasOwnProperty('status') && responseBody.status === 'error') {
        throw responseBody
      }

      if (endpoint.method === 'post') {
        this._extendSession()
      }

      return responseBody
    })
    .catch(error => {
      console.log('throw _makeRequest:', endpointKey, body)
      throw error
    })
}

nodeGlvrd.prototype._checkSessionBeforeRequest = function () {
  return new Promise((resolve, reject) => {
    if (!this.params.session || this.params.sessionValidUntil < (Date.now() + 1000)) {
      return this._createSession()
        .then(() => resolve())
        .catch(error => {
          console.log('_checkSessionBeforeRequest throw')
          reject(error)
        })
    }

    resolve()
  })
}

nodeGlvrd.prototype._fillQueryParams = function (endpointQueryParams) {
  let queryParams = {}

  endpointQueryParams.forEach(queryParamName => {
    if (this.params.hasOwnProperty(queryParamName)) {
      queryParams[queryParamName] = this.params[queryParamName]
    }
  })

  return queryParams
}

nodeGlvrd.prototype._createSession = function () {
  return new Promise((resolve, reject) => {
    this._makeRequest('postSession')
      .then(response => {
        this._resetSessionParams(response.session, response.lifespan)
        resolve()
      })
      .catch(error => {
        console.log('throw _createSession')
        reject(error)
      })
  })
}

nodeGlvrd.prototype._updateSession = function () {
  return new Promise(resolve =>
    this._makeRequest('postStatus').then(status => this._extendSession())
  )
}

nodeGlvrd.prototype._extendSession = function () {
  this._resetSessionParams(this.params.session, this.params.sessionLifespan)
}

nodeGlvrd.prototype._resetSessionParams = function (session, lifespan) {
  if (session !== this.params.session) {
    this.hintsCache = {}
  }

  this.params.session = session
  this.params.sessionLifespan = lifespan
  this.params.sessionValidUntil = Date.now() + lifespan * 1000
}

nodeGlvrd.prototype._chunkArray = function (arr, len) {
  let chunks = []
  let i = 0
  let n = arr.length

  while (i < n) {
    chunks.push(arr.slice(i, i += len))
  }

  return chunks
}

module.exports = nodeGlvrd
