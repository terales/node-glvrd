'use strict'

const test = require('ava')
const initFakeServer = require('./_initFakeServer')

const NodeGlvrd = require('../index')
const endpointsSpec = require('../endpointsSpec')

test.beforeEach(initFakeServer)

test('should throw on empty appName', t => t.throws(() => new NodeGlvrd(), Error))

test('should save appName', t => t.is(t.context.glvrd.params.app, 'testApp'))

test('should request server status', t => {
  let getStatusEndpoint = endpointsSpec.endpoints.getStatus

  t.context.catchExpectedRequest(getStatusEndpoint)

  return t.context.glvrd.checkStatus().then(
    response => t.deepEqual(response, getStatusEndpoint.responseExample)
  )
})
