'use strict';

import test from 'ava';
import sinon from 'sinon';
import nodeGlvrd from './index';
import endpointsSpec from './endpointsSpec.js';

test.beforeEach(t => {
  t.context.glvrd = new nodeGlvrd('testApp');
  t.context.requestStub = sinon.stub();

  t.context.glvrd.req = t.context.requestStub;
});

test('should throw on empty appName', t => t.throws(() => { var t = new nodeGlvrd(); }, Error));

test('should save appName', t => t.is(t.context.glvrd.params.app, 'testApp'));

test('should check server status', t => {
  t.context.requestStub.yields(null, null, endpointsSpec.endpoints.getStatus.responseExample);

  return t.context.glvrd.checkStatus().then(
    response => t.same(response, endpointsSpec.endpoints.getStatus.responseExample)
  );
});

test('should create session and save session id & lifespan value', t => {
  var responseExample = endpointsSpec.endpoints.postSession.responseExample;

  t.context.requestStub.yields(null, null, responseExample);

  return t.context.glvrd._createSession().then(response => {
    t.same(response, responseExample);
    t.is(t.context.glvrd.params.lifespan, responseExample.lifespan);
    t.is(t.context.glvrd.params.session,  responseExample.session);
  });
});

test('should proofread text and save hints to cache', t => { // TODO Fix this test
  var postProofread = endpointsSpec.endpoints.postProofread;
  var postHints     = endpointsSpec.endpoints.postHints;

  t.context.requestStub.yields(null, null, postProofread.responseExample);
  t.context.requestStub.yields(null, null, postHints.responseExample);

  return t.context.glvrd.proofread(postProofread.textExample).then(fragments => {
    t.same(fragments, [
      { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } },
      { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Сложный синтаксис',    description: 'Упростите' } },
      { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
      { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
      { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
      { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
      { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } }
    ]);

    t.same(t.context.glvrd.hintsCache, postHints.responseExample)
  });
});

test.todo('Implement clearing hints cache on session update');

test.todo('Write tests for corner cases described in API documentation');
