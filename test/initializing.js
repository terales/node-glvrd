'use strict';

import test from 'ava';
import nock from 'nock';

import nodeGlvrd from '../index';
import endpointsSpec from '../endpointsSpec.js';

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

test('should request server status', t => {
  let getStatusEndpoint = endpointsSpec.endpoints.getStatus;

  t.context.catchExpectedRequest(getStatusEndpoint);

  return t.context.glvrd.checkStatus().then(
    response => t.deepEqual(response, getStatusEndpoint.responseExample)
  );
});
