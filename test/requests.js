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

test.todo('should throw error if http response code is not in 200 group');

test.todo('should retry request if there was too mane requests sent');

test.todo('should retry request if glvrd is busy');

test.todo('should throw error if error received in generic requests');

test.todo('should throw error if there is no correct json object');

test.todo('should throw error if there is empty response');

test.todo('should throw error if there is no answer more that timeout');
