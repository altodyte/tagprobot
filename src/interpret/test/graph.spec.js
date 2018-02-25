import test from 'tape';
import { Graph } from '../class/Graph';
import { Point } from '../class/Point';


test('numEdges', t => {
  const g = new Graph();
  g.addEdgeAndVertices(new Point(0, 0), new Point(1, 0));
  g.addEdgeAndVertices(new Point(0, 0), new Point(-1, 0));
  g.addEdgeAndVertices(new Point(0, 0), new Point(0, -1));
  g.addEdgeAndVertices(new Point(0, 0), new Point(0, 1));
  t.is(g.numEdges(), 4);
  t.end();
});


test('edgesInLineWith', t => {
  const g = new Graph();
  g.addEdgeAndVertices(new Point(2, 1), new Point(3, 2));
  g.addEdgeAndVertices(new Point(2, 2), new Point(3, 3));
  g.addEdgeAndVertices(new Point(-1, 1), new Point(-1, 2));
  g.addEdgeAndVertices(new Point(-2, 1), new Point(-2, 0));
  g.addEdgeAndVertices(new Point(-2, -1), new Point(-2, 0));
  g.addEdgeAndVertices(new Point(0, -1), new Point(-2, -3));
  g.addEdgeAndVertices(new Point(-4, -5), new Point(-3, -4));
  g.addEdgeAndVertices(new Point(0, -3), new Point(3, -3));
  t.is(g.edgesInLineWith({ p1: new Point(2, 1), p2: new Point(3, 2) }).length, 3);
  t.is(g.edgesInLineWith({ p1: new Point(-1, 0), p2: new Point(-1, -1) }).length, 1);
  t.is(g.edgesInLineWith({ p1: new Point(-2, 0), p2: new Point(-2, -1) }).length, 2);
  t.is(g.edgesInLineWith({ p1: new Point(-3, 0), p2: new Point(-2, -1) }).length, 0);
  t.is(g.edgesInLineWith({ p1: new Point(-3, -3), p2: new Point(-2, -3) }).length, 1);
  t.end();
});
