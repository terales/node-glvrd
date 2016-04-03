'use strict';

import test from 'ava';
import nock from 'nock';
import nodeGlvrd from './index';
import endpointsSpec from './endpointsSpec.js';

test.beforeEach(t => {
  t.context.glvrd = new nodeGlvrd('testApp');
  t.context.fakeServer = nock(endpointsSpec.baseUrl).log(console.log);
  nock.disableNetConnect();

  t.context.catchExpectedRequest = function(endpoint) {
    t.context
      .fakeServer[endpoint.method](endpoint.name)
      .query({app: 'testApp'}) // TODO Prepare expected queries in endpointSpecs
      .reply(200, endpoint.responseExample);
  }
});

test('should throw on empty appName', t => t.throws(() => { var t = new nodeGlvrd(); }, Error));

test('should save appName', t => t.is(t.context.glvrd.params.app, 'testApp'));

test('should check server status', t => {
  let getStatusEndpoint = endpointsSpec.endpoints.getStatus;

  t.context.catchExpectedRequest(getStatusEndpoint);

  return t.context.glvrd.checkStatus().then(
    response => t.same(response, getStatusEndpoint.responseExample)
  );
});

test('should create session and save session id & lifespan value', t => {
  var postSession = endpointsSpec.endpoints.postSession;

  t.context.catchExpectedRequest(postSession);

  return t.context.glvrd._createSession().then(response => {
    t.same(response, postSession.responseExample);
    t.is(t.context.glvrd.params.lifespan, postSession.responseExample.lifespan);
    t.is(t.context.glvrd.params.session,  postSession.responseExample.session);
  });
});

test('should proofread text and save hints to cache', t => {
  var postProofread = endpointsSpec.endpoints.postProofread;
  var postHints     = endpointsSpec.endpoints.postHints;

  t.context.catchExpectedRequest(postProofread);
  t.context.catchExpectedRequest(postHints);

  return t.context.glvrd.proofread(postProofread.textExample)
    .then(fragments => {
      t.same(fragments, [
        { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
        { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
        { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } },
        { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Сложный синтаксис',    description: 'Упростите' } },
        { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } }
      ]);

      t.same(t.context.glvrd.hintsCache, postHints.responseExample.hints)
    }, error => { console.log(error); t.fail(); } );
});

test.todo('Implement clearing hints cache on session update');

test.todo('Write tests for corner cases described in API documentation');
