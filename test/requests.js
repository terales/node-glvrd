'use strict'

const test = require('ava')
const sinon = require('sinon')
const initFakeServer = require('./_initFakeServer')

const endpointsSpec = require('../endpointsSpec')

test.beforeEach(initFakeServer)

test('should throw error if http response code is not in 200 group', t => {
  let getStatusEndpoint = endpointsSpec.endpoints.getStatus
  t.context.catchExpectedRequest(getStatusEndpoint, 500)
  return t.throws(t.context.glvrd.checkStatus(), Error)
})

test('should throw error if there was too many requests sent', t => {
  /*
   * Main idea here is to empower client app with knowlendge about errors,
   * so they can provide full feedback to user instead of silently freezing
   */
  let errorFromServer = endpointsSpec.errorsForCover.too_many_requests
  let requestStub = sinon.stub(t.context.glvrd, 'req')
  requestStub.returns(errorFromServer)

  // TODO Change approach and use t.throws() instead
  t.context.glvrd.proofread('test').catch(err =>
    t.is(err, errorFromServer))
})

test('should throw error if glvrd is busy', t => {
  let errorFromServer = endpointsSpec.errorsForCover.busy
  let requestStub = sinon.stub(t.context.glvrd, 'req')
  requestStub.returns(errorFromServer)

  // TODO Change approach and use t.throws() instead
  t.context.glvrd.proofread('test').catch(err =>
    t.is(err, errorFromServer))
})

test.todo('should throw error if error received in generic requests')

test.todo('should throw error if there is no correct json object')

test.todo('should throw error if there is empty response')

test.todo('should throw error if there is no answer more that timeout')
