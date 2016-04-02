'use strict';

import test from 'ava';
import nodeGlvrd from './index';
import endpointsSpec from './endpointsSpec.js';

test.beforeEach(t => {
  t.context.glvrd = new nodeGlvrd('testApp');
});

test('should throw on empty appName', t => t.throws(() => { var t = new nodeGlvrd(); }, Error));

test('should save appName', t => t.is(t.context.glvrd.appName, 'testApp'));

test('should set default request url', t => t.is(t.context.glvrd.request.defaults.baseUrl, endpointsSpec.baseUrl));
