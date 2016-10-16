'use strict'

const test = require('ava')
const nock = require('nock')
const sinon = require('sinon')

const NodeGlvrd = require('../index')
const endpointsSpec = require('../endpointsSpec')

test.before(t => { nock.disableNetConnect() })

test.beforeEach(t => {
  t.context.glvrd = new NodeGlvrd('testApp')
  t.context.spec = JSON.parse(JSON.stringify(endpointsSpec))
  t.context.sandbox = sinon.sandbox.create()
})

test.afterEach(t => t.context.sandbox.restore())

test('proofread just after initialization', t => {
  let postProofread = t.context.spec.endpoints.postProofread

  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')
  _makeRequestStub
    .withArgs('postProofread', 'text=' + postProofread.textExample)
    .returns(Promise.resolve(postProofread.responseExample))

  let _fillRawFragmentsWithHintsStub = t.context.sandbox.stub(t.context.glvrd, '_fillRawFragmentsWithHints')
  let filledFragments = [ {
    start: 5,
    end: 25,
    hint: {
      id: 'r772367523480',
      name: 'Газетный штамп',
      description: 'Манерно, попробуйте проще'
    }
  } ]
  _fillRawFragmentsWithHintsStub
    .withArgs(postProofread.responseExample)
    .returns(Promise.resolve(filledFragments))

  t.context.glvrd
    .proofread(postProofread.textExample)
    .then(returnValue => {
      t.deepEqual(returnValue, filledFragments)
      t.true(_makeRequestStub.called)
      t.true(_fillRawFragmentsWithHintsStub.called)
    })
})

test('use cached hints if available', t => {
  let rawFragments = t.context.spec.endpoints.postProofread.responseExample.fragments
  t.context.glvrd.hintsCache = t.context.spec.endpoints.postHints.responseExample.hints // emulate caches

  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')

  return t.context.glvrd
    ._fillRawFragmentsWithHints(rawFragments)
    .then(filledFragments => {
      t.deepEqual(filledFragments, [
        /* eslint-disable no-multi-spaces */
        { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
        { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
        { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } },
        { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Сложный синтаксис',    description: 'Упростите' } },
        { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } }
        /* eslint-enable no-multi-spaces */
      ])

      t.false(_makeRequestStub.called)
    })
})

test('request uncached hints while several already cached', t => {
  let rawFragments = t.context.spec.endpoints.postProofread.responseExample.fragments

  t.context.glvrd.hintsCache = { // emulate cache
    'r661353765732': { 'name': 'Сложный синтаксис', 'description': 'Упростите' },
    'r772367523480': { 'name': 'Газетный штамп', 'description': 'Манерно, попробуйте проще' }
  }

  let hintsResponse = t.context.spec.endpoints.postHints.responseExample
  Object.keys(t.context.glvrd.hintsCache).forEach(key => delete hintsResponse.hints[key]) // remove cached hints from future response

  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')
  _makeRequestStub.returns(Promise.resolve(hintsResponse))

  return t.context.glvrd
    ._fillRawFragmentsWithHints(rawFragments)
    .then(filledFragments => {
      t.deepEqual(filledFragments, [
        /* eslint-disable no-multi-spaces */
        { start: 5,   end: 25,  hint: { id: 'r772367523480', name: 'Газетный штамп',       description: 'Манерно, попробуйте проще' } },
        { start: 26,  end: 37,  hint: { id: 'r741067498476', name: 'Необъективная оценка', description: 'Удалите или докажите фактами' } },
        { start: 54,  end: 61,  hint: { id: 'r772592703516', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 65,  end: 85,  hint: { id: 'r600555156012', name: 'Паразит времени',      description: 'Уберите, уточните или противопоставьте прошлому или будущему' } },
        { start: 112, end: 137, hint: { id: 'r772817883552', name: 'Газетный штамп',       description: 'Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово' } },
        { start: 139, end: 165, hint: { id: 'r661353765732', name: 'Сложный синтаксис',    description: 'Упростите' } },
        { start: 199, end: 217, hint: { id: 'r585918453672', name: 'Газетный штамп',       description: 'Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной' } }
        /* eslint-enable no-multi-spaces */
      ])
      t.true(_makeRequestStub.called)
    })
})

test('should accept empty response on proofread', t => {
  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')
  _makeRequestStub.returns(Promise.resolve({ status: 'ok', fragments: [] }))

  t.context.glvrd.proofread('dummy text').then(fragments => t.is(fragments, []))
})

test('should make several hint requests if we have more then permitted for single request', t => {
  let rawFragments = t.context.spec.endpoints.postProofread.responseExample.fragments
  t.context.glvrd.params.maxHintsCount = 2

  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')
  _makeRequestStub.onCall(0).returns(Promise.resolve({ status: 'ok', hints: { '0': '--' } }))
  _makeRequestStub.onCall(1).returns(Promise.resolve({ status: 'ok', hints: { '1': '--' } }))
  _makeRequestStub.onCall(2).returns(Promise.resolve({ status: 'ok', hints: { '2': '--' } }))
  _makeRequestStub.onCall(3).returns(Promise.resolve({ status: 'ok', hints: { '3': '--' } }))

  let _fillFragmentsWithHintFromCacheStub = t.context.sandbox.stub(t.context.glvrd, '_fillFragmentsWithHintFromCache')

  return t.context.glvrd
    ._fillRawFragmentsWithHints(rawFragments)
    .then(() => {
      t.is(_makeRequestStub.callCount, 4)
      t.deepEqual(t.context.glvrd.hintsCache, {
        '0': '--', '1': '--', '2': '--', '3': '--'
      })
    })
})

test('should accept callback style', t => {
  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')
  _makeRequestStub.returns(Promise.resolve({ status: 'ok', fragments: [] }))

  t.context.glvrd.proofread('dummy text', (err, fragments) => {
    t.falsy(err)
    t.is(fragments, [])
  })
})

test('should work throw error for callback style too', t => {
  let errorFromServer = t.context.spec.errorsForCover.busy

  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')
  _makeRequestStub.returns(Promise.resolve(errorFromServer))

  t.context.glvrd.proofread('dummy text', (err, fragments) => {
    t.is(err, errorFromServer)
    t.falsy(fragments, [])
  })
})

test('should make several proofread requests for text longer than .params.maxTextLength', t => {
  let _makeRequestStub = t.context.sandbox.stub(t.context.glvrd, '_makeRequest')
  _makeRequestStub.returns(Promise.resolve({ status: 'ok', fragments: [] }))

  t.context.glvrd.params.maxTextLength = 3

  t.context.glvrd.proofread('dummy text', (err, fragments) => {
    t.falsy(err)
    t.is(fragments, [])
    t.is(_makeRequestStub.callCount, 4)
  })
})
