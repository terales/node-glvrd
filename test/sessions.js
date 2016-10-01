'use strict'

const test = require('ava')
const nock = require('nock')
const sinon = require('sinon')

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

test('should create session and save session id & lifespan value', t => {
  var postSession = endpointsSpec.endpoints.postSession

  t.context.catchExpectedRequest(postSession)

  return t.context.glvrd._createSession().then(response => {
    t.is(t.context.glvrd.params.session, postSession.responseExample.session)
    t.is(t.context.glvrd.params.sessionLifespan, postSession.responseExample.lifespan)
  })
})

test('should extend session on any post request', t => {
  var postStatus = endpointsSpec.endpoints.postStatus
  t.context.catchExpectedRequest(postStatus)

  var sessionFixture = endpointsSpec.endpoints.postSession.responseExample
  t.context.glvrd._resetSessionParams(sessionFixture.session, sessionFixture.lifespan)
  var initialSessionValidUntil = t.context.glvrd.params.sessionValidUntil

  return t.context.glvrd._makeRequest('postStatus')
    .then(() => t.true(t.context.glvrd.params.sessionValidUntil > initialSessionValidUntil))
})

test('should create new session if session key is outdated', t => {
  let createSessionStub = sinon.stub(t.context.glvrd, '_createSession')
  createSessionStub.returns(Promise.resolve())

  t.context.glvrd._resetSessionParams('sessionKey', 0) // our key will be ok for current timestamp only
  t.context.glvrd._checkSessionBeforeRequest()

  t.true(createSessionStub.called)
})

test.todo('should update session key if there is error about it from glvrd')

test.todo('should clear hints cache on session key update')
