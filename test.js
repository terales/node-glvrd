import test from 'ava';
import nodeGlvrd from './index';

test('should nodeGlvrd', (t) =>
  t.is(nodeGlvrd('unicorns'), 'unicorns'));

test('should throw on empty input', t => t.throws(() => { nodeGlvrd(); }, TypeError));
test('should throw on invalid input', t => t.throws(() => { nodeGlvrd(2); }, TypeError));
