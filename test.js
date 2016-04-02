'use strict';

import test from 'ava';
import nodeGlvrd from './index';

test.beforeEach(t => {
  t.context.glvrd = new nodeGlvrd('testApp');
});

test('should save appName', t => t.is(t.context.glvrd.appName, 'testApp'));

test('should throw on empty input', t => t.throws(() => { nodeGlvrd(); }, TypeError));
