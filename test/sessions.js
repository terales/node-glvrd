'use strict'

const test = require('ava')
const sinon = require('sinon')
const initFakeServer = require('./_initFakeServer')

const endpointsSpec = require('../endpointsSpec')

test.beforeEach(initFakeServer)

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

test('should silently update session if received bad_session error', t => {
  t.context.glvrd._resetSessionParams('sessionKey', 10000)

  let errorFromServer = endpointsSpec.errorsForCover.bad_session
  let requestStub = sinon.stub(t.context.glvrd, 'req')
  requestStub.onCall(0).returns(errorFromServer)

  let newSession = endpointsSpec.endpoints.postSession.responseExample
  requestStub.onCall(1).returns(newSession)
  requestStub.onCall(2).returns({ status: 'ok', fragments: [] })

  return t.context.glvrd.proofread('').then(fragmentsWithHints => {
    t.is(t.context.glvrd.params.session, newSession.session)
  })
})

test('should clear hints cache on session key update', t => {
  t.context.glvrd.params.session = 'initial-session'
  t.context.glvrd.hintsCache = { // emulate cache
    'r661353765732': { 'name': 'Сложный синтаксис', 'description': 'Упростите' },
    'r772367523480': { 'name': 'Газетный штамп', 'description': 'Манерно, попробуйте проще' }
  }

  t.context.glvrd._resetSessionParams('new-session', 10000)

  t.is(Object.keys(t.context.glvrd.hintsCache).length, 0)
})
