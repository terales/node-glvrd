'use strict';

import test from 'ava';
import nock from 'nock';
import sinon from 'sinon';
import nodeGlvrd from './index';
import endpointsSpec from './endpointsSpec.js';

test.beforeEach(t => {
  t.context.glvrd = new nodeGlvrd('testApp');
  t.context.fakeServer = nock(endpointsSpec.baseUrl);
  nock.disableNetConnect();

  t.context.catchExpectedRequest = function(endpoint) {
    t.context
      .fakeServer[endpoint.method](endpoint.name)
      .query(endpoint.queryExample)
      .reply(200, endpoint.responseExample);
  }
});

test('should throw on empty appName', t => t.throws(() => { var t = new nodeGlvrd(); }, Error));

test('should save appName', t => t.is(t.context.glvrd.params.app, 'testApp'));

test('should check server status', t => {
  let getStatusEndpoint = endpointsSpec.endpoints.getStatus;

  t.context.catchExpectedRequest(getStatusEndpoint);

  return t.context.glvrd.checkStatus().then(
    response => t.deepEqual(response, getStatusEndpoint.responseExample)
  );
});

test('should create session and save session id & lifespan value', t => {
  var postSession = endpointsSpec.endpoints.postSession;

  t.context.catchExpectedRequest(postSession);

  return t.context.glvrd._createSession().then(response => {
    t.is(t.context.glvrd.params.session,  postSession.responseExample.session);
    t.is(t.context.glvrd.params.sessionLifespan, postSession.responseExample.lifespan);
  });
});

test('should create session, proofread text and save hints to cache', t => {
  var postSession   = endpointsSpec.endpoints.postSession;
  var postProofread = endpointsSpec.endpoints.postProofread;
  var postHints     = endpointsSpec.endpoints.postHints;

  t.context.catchExpectedRequest(postSession);
  t.context.catchExpectedRequest(postProofread);
  t.context.catchExpectedRequest(postHints);

  return t.context.glvrd.proofread(postProofread.textExample)
    .then(fragments => {
      t.deepEqual(fragments, [
        { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
        { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
        { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } },
        { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Сложный синтаксис',    description: 'Упростите' } },
        { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } }
      ]);

      t.deepEqual(t.context.glvrd.hintsCache, postHints.responseExample.hints);
    })
    .catch(error => { console.log(error); t.fail(); });
});

test('should use cached hints for proofread test', t => {
  var postSession = endpointsSpec.endpoints.postSession;
  var postProofread = endpointsSpec.endpoints.postProofread;

  t.context.catchExpectedRequest(postSession);
  t.context.catchExpectedRequest(postProofread);

  return t.context.glvrd._createSession()
    .then(() => {
      t.context.glvrd.hintsCache = endpointsSpec.endpoints.postHints.responseExample.hints; // emulate cache
      return t.context.glvrd.proofread(postProofread.textExample); })
    .then(fragments =>
      t.deepEqual(fragments, [
        { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
        { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
        { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } },
        { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Сложный синтаксис',    description: 'Упростите' } },
        { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } }
      ])
    );
});

test('should extend session on any post request', t => {
  var postStatus  = endpointsSpec.endpoints.postStatus;
  t.context.catchExpectedRequest(postStatus);

  var sessionFixture = endpointsSpec.endpoints.postSession.responseExample;
  t.context.glvrd._resetSessionParams(sessionFixture.session, sessionFixture.lifespan);
  var initialSessionValidUntil =  t.context.glvrd.params.sessionValidUntil;

  return t.context.glvrd._makeRequest('postStatus')
    .then(() => t.true(t.context.glvrd.params.sessionValidUntil > initialSessionValidUntil));
});

test('should create new session if session key is outdated', t => {
  let createSessionStub = sinon.stub(t.context.glvrd, '_createSession');
  createSessionStub.returns(Promise.resolve());

  t.context.glvrd._resetSessionParams('sessionKey', 0); // our key will be ok for current timestamp only
  t.context.glvrd._checkSessionBeforeRequest();

  t.true(createSessionStub.called);
});

test.todo('should clear hints cache on session key update');

test.todo('should make several proofread requests for very long text');

test.todo('should make several hints requests if we need more then permitted for single request');

test.todo('should throw error if error received in generic request answer');

test.todo('should throw error if there is no correct json object');

test.todo('should throw error if there is empty response');

test.todo('should throw error if there is no answer more that timeout');

test.todo('should retry request if glvrd is busy');

test.todo('should retry request if there was too mane requests sent');

test.todo('should update session key if there is error about it from glvrd');

test.todo('should throw error if http response code is in 400-500 group');

test.todo('should accept empty response on proofread');

test.todo('switch from functional to unit tests');
