'use strict'

const test = require('ava')
const nock = require('nock')

const NodeGlvrd = require('../index')
const endpointsSpec = require('../endpointsSpec')

test.beforeEach(t => {
  t.context.glvrd = new NodeGlvrd('testApp')
  t.context.fakeServer = nock(endpointsSpec.baseUrl)
  nock.disableNetConnect()

  t.context.catchExpectedRequest = function (endpoint, replyCode = 200) {
    t.context
      .fakeServer[endpoint.method](endpoint.name)
      .query(endpoint.queryExample)
      .reply(replyCode, endpoint.responseExample)
  }
})

test('should throw error if http response code is not in 200 group', t => {
  let getStatusEndpoint = endpointsSpec.endpoints.getStatus
  t.context.catchExpectedRequest(getStatusEndpoint, 500)
  return t.throws(t.context.glvrd.checkStatus(), Error)
})

test.todo('should retry request if there was too mane requests sent')

test.todo('should retry request if glvrd is busy')

test.todo('should throw error if error received in generic requests')

test.todo('should throw error if there is no correct json object')

test.todo('should throw error if there is empty response')

test.todo('should throw error if there is no answer more that timeout')
