import test from 'tape';

import { Matrix } from '../Matrix';


test('Matrix.dot()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[1, 0], [0, 1]]);
    const b = new Matrix([[4, 1], [2, 2]]);

    t.same(a.dot(b), new Matrix([[4, 1], [2, 2]]));

    t.end();
  });

  tester.test('works for 1D arrays', t => {
    const a = new Matrix([2, 3]);
    const b = new Matrix([2, 3]);

    t.same(a.dot(b), new Matrix(13));

    t.end();
  });
});

test('Matrix.add()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[1, 2], [3, 4]]);
    const b = new Matrix([[1, 2], [3, 4]]);

    t.same(a.add(b), new Matrix([[2, 4], [6, 8]]));

    t.end();
  });
});

test('Matrix.subtract()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[2, 4], [6, 8]]);
    const b = new Matrix([[1, 2], [3, 4]]);

    t.same(a.subtract(b), new Matrix([[1, 2], [3, 4]]));

    t.end();
  });
});

test('Matrix.inverse()', tester => {
  tester.test('works for 2D arrays', t => {
    const a = new Matrix([[4, 7], [2, 6]]);

    t.same(a.inverse(), new Matrix([[0.6, -0.7], [-0.2, 0.4]]));

    t.end();
  });
});

test('Matrix.append()', tester => {
  tester.test('adds a new row by default', t => {
    const a = new Matrix([[2, 4], [6, 8]]);
    const b = [[1, 2]];

    a.append(b);
    t.same(a, new Matrix([[2, 4], [6, 8], [1, 2]]));

    t.end();
  });

  tester.test('adds a new column if axis is 1', t => {
    const a = new Matrix([[2, 4], [6, 8]]);
    const b = [[1], [2]];

    a.append(b, 1);
    t.same(a, new Matrix([[2, 4, 1], [6, 8, 2]]));

    t.end();
  });

  tester.test('works for Matrix inputs', t => {
    const a = new Matrix([[2, 4], [6, 8]]);
    const b = new Matrix([[1, 2]]);

    a.append(b);
    t.same(a, new Matrix([[2, 4], [6, 8], [1, 2]]));

    t.end();
  });
});
