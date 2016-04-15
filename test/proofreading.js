'use strict';

import test from 'ava';
import sinon from 'sinon';
import nock from 'nock';

import nodeGlvrd from '../index';
import endpointsSpec from '../endpointsSpec.js';

test.before(t => { nock.disableNetConnect(); });

test.beforeEach(t => {
  t.context.glvrd = new nodeGlvrd('testApp');
});

test('proofread just after initialization', t => {
  let postProofread = endpointsSpec.endpoints.postProofread;

  let _makeRequestStub = sinon.stub(t.context.glvrd, '_makeRequest');
  _makeRequestStub
    .withArgs('postProofread', 'text=' + postProofread.textExample)
    .returns(Promise.resolve(postProofread.responseExample));

  let _fillRawFragmentsWithHintsStub = sinon.stub(t.context.glvrd, '_fillRawFragmentsWithHints');
  let filledFragments = [ {
    start: 5,
    end: 25,
    hint: {
      id: 'r772367523480',
      name: 'Газетный штамп',
      description: 'Манерно, попробуйте проще'
    }
  } ];
  _fillRawFragmentsWithHintsStub
    .withArgs(postProofread.responseExample)
    .returns(Promise.resolve(filledFragments));

  t.context.glvrd
    .proofread(postProofread.textExample)
    .then(returnValue => {
      t.deepEqual(returnValue, filledFragments);
      t.true(_makeRequestStub.called);
      t.true(_fillRawFragmentsWithHintsStub.called);
    });
});

test('use cached hints if available', t => {
  let rawFragments = endpointsSpec.endpoints.postProofread.responseExample.fragments;
  t.context.glvrd.hintsCache = endpointsSpec.endpoints.postHints.responseExample.hints; // emulate caches

  let _makeRequestStub = sinon.stub(t.context.glvrd, '_makeRequest');

  t.context.glvrd
    ._fillRawFragmentsWithHints(rawFragments)
    .then(filledFragments => {
      t.deepEqual(filledFragments, [
        { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
        { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
        { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } },
        { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Сложный синтаксис',    description: 'Упростите' } },
        { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } }
      ]);

      t.false(_makeRequestStub.called);
    });
});

test('request uncached hints while several already cached', t => {
  let rawFragments = endpointsSpec.endpoints.postProofread.responseExample.fragments;
  t.context.glvrd.hintsCache = { // emulate cache
    "r661353765732": {"name": "Сложный синтаксис", "description": "Упростите"},
    "r772367523480": {"name": "Газетный штамп", "description": "Манерно, попробуйте проще"}
  };

  let hintsResponse = endpointsSpec.endpoints.postHints.responseExample;
  Object.keys(t.context.glvrd.hintsCache).forEach(key => delete hintsResponse.hints[key]); // remove cached hints from future response

  let _makeRequestStub = sinon.stub(t.context.glvrd, '_makeRequest');
  _makeRequestStub.returns(Promise.resolve(hintsResponse));

  t.context.glvrd
    ._fillRawFragmentsWithHints(rawFragments)
    .then(filledFragments => {
      t.deepEqual(filledFragments, [
        { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
        { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
        { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } },
        { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Сложный синтаксис',    description: 'Упростите' } },
        { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } }
      ]);
      t.true(_makeRequestStub.called);
    });
});

test('should accept empty response on proofread', t => {
  let _makeRequestStub = sinon.stub(t.context.glvrd, '_makeRequest');
  _makeRequestStub.returns(Promise.resolve({ status: 'ok', fragments: [] }));

  t.context.glvrd.proofread('dummy text').then(fragments => t.is(fragments, []));
});

test('should make several hints requests if we have more then permitted for single request', t => {
  let rawFragments = endpointsSpec.endpoints.postProofread.responseExample.fragments;
  t.context.glvrd.params.maxHintsCount = 2;

  let _makeRequestStub = sinon.stub(t.context.glvrd, '_makeRequest');
  _makeRequestStub.returns(Promise.resolve({ status: 'ok', hints: [ '1' ] }));

  let _fillFragmentsWithHintFromCacheStub = sinon.stub(t.context.glvrd, '_fillFragmentsWithHintFromCache');
  _fillFragmentsWithHintFromCacheStub.returns(Promise.resolve());

  t.context.glvrd
    ._fillRawFragmentsWithHints(rawFragments)
    .then(() => {
      t.is(_makeRequestStub.callCount, 4);
      t.is(t.context.glvrd.hintsCache, [ '1', '1', '1', '1' ]); // from _makeRequestStub returns × callCount
    });
});

test.todo('should make several proofread requests for very long text');
