import test from 'tape';
import assert from '../src/utils/asserts';


test('test assert', t => {
  let condition = false;
  t.throws(() => { assert(condition); });

  condition = true;
  t.doesNotThrow(() => { assert(condition); });

  t.end();
});
