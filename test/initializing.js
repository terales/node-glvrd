'use strict'

const test = require('ava')
const nock = require('nock')

const NodeGlvrd = require('../index')
const endpointsSpec = require('../endpointsSpec')

test.beforeEach(t => {
  t.context.glvrd = new NodeGlvrd('testApp')
  t.context.fakeServer = nock(endpointsSpec.baseUrl)
  nock.disableNetConnect()

  t.context.catchExpectedRequest = function (endpoint) {
    t.context
      .fakeServer[endpoint.method](endpoint.name)
      .query(endpoint.queryExample)
      .reply(200, endpoint.responseExample)
  }
})

test('should throw on empty appName', t => t.throws(() => new NodeGlvrd(), Error))

test('should save appName', t => t.is(t.context.glvrd.params.app, 'testApp'))

test('should request server status', t => {
  let getStatusEndpoint = endpointsSpec.endpoints.getStatus

  t.context.catchExpectedRequest(getStatusEndpoint)

  return t.context.glvrd.checkStatus().then(
    response => t.deepEqual(response, getStatusEndpoint.responseExample)
  )
})
