import test from 'tape';

import { Point } from '../../../global/class/Point';
import { Edge } from '../../../global/class/Edge';


test('Edge.isBetweenPoints()', tester => {
  tester.test('returns true when points are on the left side of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(0, 0);
    const p2 = new Point(0, 1);

    t.false(edge.isBetweenPoints(p1, p2));

    t.end();
  });

  tester.test('returns true when points are on the right side of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(4, 0);
    const p2 = new Point(4, 1);

    t.false(edge.isBetweenPoints(p1, p2));

    t.end();
  });

  tester.test('returns strict behavior when one point is coincident with edge', t => {
    const edge = new Edge(new Point(3, 3), new Point(5, 5));
    const p1 = new Point(4, 4);
    const p2 = new Point(5, 4);

    t.false(edge.isBetweenPoints(p1, p2, true));
    t.true(edge.isBetweenPoints(p1, p2, false));

    t.end();
  });

  tester.test('returns strict behavior when one point is collinear with edge', t => {
    const edge = new Edge(new Point(3, 3), new Point(5, 5));
    const p1 = new Point(2, 2);
    const p2 = new Point(2, 3);

    t.false(edge.isBetweenPoints(p1, p2, true));
    t.true(edge.isBetweenPoints(p1, p2, false));

    t.end();
  });

  tester.test('returns strict behavior when one point is an edge endpoint', t => {
    const edge = new Edge(new Point(3, 3), new Point(5, 5));
    const p1 = new Point(3, 3);
    const p2 = new Point(3, 5);

    t.false(edge.isBetweenPoints(p1, p2, true));
    t.true(edge.isBetweenPoints(p1, p2, false));

    t.end();
  });

  tester.test('returns false when points are on opposite sides of the edge', t => {
    const edge = new Edge(new Point(3, 0), new Point(3, 1));
    const p1 = new Point(0, 0);
    const p2 = new Point(4, 1);

    t.true(edge.isBetweenPoints(p1, p2));

    t.end();
  });
});


test('Edge.overlapsEdge()', tester => {
  tester.test('returns true when one edge contains the other', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(4, 1), new Point(5, 2));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns true when one point in the middle of edge, other is shared endpoint', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(4, 1), new Point(6, 3));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns true one point inside edge, other is not', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(4, 1), new Point(7, 4));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns true one edge ends where the other begins', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(6, 3), new Point(7, 4));

    t.true(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns false edge point is on other edge, but edges are not collinear', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    let e2 = new Edge(new Point(4, 1), new Point(5, 1));

    t.false(e1.overlapsEdge(e2));

    e2 = new Edge(new Point(4, 1), new Point(6, 2));
    t.false(e1.overlapsEdge(e2));

    t.end();
  });

  tester.test('returns false when edges are collinear but not coincident', t => {
    const e1 = new Edge(new Point(3, 0), new Point(6, 3));
    const e2 = new Edge(new Point(7, 4), new Point(8, 5));

    t.false(e1.overlapsEdge(e2));

    t.end();
  });
});