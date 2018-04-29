import test from 'tape';

import {
  getUnmergedGraph,
  getMergedGraph,
  initNavMesh,
  getDTGraph,
} from '../../setup';
import { isRoughly } from '../../../global/utils';
import { Point } from '../Point';
import { Edge } from '../Edge';
import { Triangle } from '../Triangle';
import { TriangleGraph, __RewireAPI__ as TriangleGraphRewireAPI } from '../TriangleGraph';
import { updateUnmergedGraph, updateMergedGraph } from '../../mapToGraph';
import { setupTiles, teardownTiles } from '../../test/setupTiles.spec';
import {
  setupPixiAndTagpro,
  resetPixiAndTagpro,
} from '../../../draw/class/test/DrawableGraph.spec';


test('triangulateRegion does not create flat triangle when points are in a line', t => {
  setupPixiAndTagpro();

  const tGraph = new TriangleGraph();
  const p1 = new Point(1080, 640);
  const p2 = new Point(1200, 680);
  const p3 = new Point(1200, 720);
  const p4 = new Point(1200, 760);
  tGraph.addEdgeAndVertices(new Edge(p1, p2));
  tGraph.addEdgeAndVertices(new Edge(p2, p3));
  tGraph.addEdgeAndVertices(new Edge(p3, p4));
  tGraph.addEdgeAndVertices(new Edge(p4, p1));
  tGraph.addFixedEdge(new Edge(p1, p4));
  t.doesNotThrow(() => tGraph.triangulateRegion([p1, p2, p3, p4]));

  t.true(tGraph.findTriangle(p1, p4, p3) !== null);
  t.true(tGraph.findTriangle(p1, p2, p3) !== null);
  t.true(tGraph.findTriangle(p1, p4, p2) === null);

  resetPixiAndTagpro();

  t.end();
});


// test('delaunayRemoveVertex', tester => {
//   tester.test('removes vertex surrounded by 4 points, and validly retriangulates 4 points', t => {
//     setupPixiAndTagpro();

//     const mockDTGraph = new TriangleGraph();
//     const v0 = new Point(0, 0);
//     const v1 = new Point(0, 10);
//     const v2 = new Point(10, 10);
//     const v3 = new Point(10, 0);
//     const p = new Point(3, 6);
//     mockDTGraph.addTriangle(new Triangle(p, v0, v1));
//     mockDTGraph.addTriangle(new Triangle(p, v1, v2));
//     mockDTGraph.addTriangle(new Triangle(p, v2, v3));
//     mockDTGraph.addTriangle(new Triangle(p, v3, v0));
//     mockDTGraph.delaunayRemoveVertex(p);

//     t.is(mockDTGraph.triangles.size, 2);
//     t.is(mockDTGraph.getVertices().length, 4);
//     t.is(mockDTGraph.getEdges().length, 5);
//     // One of the diagonals is connected
//     t.true(mockDTGraph.isConnected(v0, v2) !== mockDTGraph.isConnected(v1, v3));

//     resetPixiAndTagpro();

//     t.end();
//   });

//   tester.test('removes vertex surrounded by 5 points, and validly retriangulates 5 points', t => {
//     setupPixiAndTagpro();

//     const mockDTGraph = new TriangleGraph();
//     const v0 = new Point(0, 0);
//     const v1 = new Point(0, 10);
//     const v2 = new Point(10, 10);
//     const v3 = new Point(10, 0);
//     const v4 = new Point(-3, 5);
//     const p = new Point(3, 6);
//     // Create a pentagon, with p in the center connected to all other vertices
//     mockDTGraph.addTriangle(new Triangle(p, v0, v4));
//     mockDTGraph.addTriangle(new Triangle(p, v4, v1));
//     mockDTGraph.addTriangle(new Triangle(p, v1, v2));
//     mockDTGraph.addTriangle(new Triangle(p, v2, v3));
//     mockDTGraph.addTriangle(new Triangle(p, v3, v0));
//     mockDTGraph.delaunayRemoveVertex(p);

//     t.is(mockDTGraph.triangles.size, 3);
//     t.is(mockDTGraph.getVertices().length, 5);
//     t.is(mockDTGraph.getEdges().length, 7);
//     // Triangle on the left of the square is connected
//     t.true(mockDTGraph.isConnected(v0, v1));
//     // One of the diagonals is connected
//     t.true(mockDTGraph.isConnected(v0, v2) !== mockDTGraph.isConnected(v1, v3));

//     resetPixiAndTagpro();

//     t.end();
//   });
// });


// test('dynamicUpdate', tester => {
//   tester.test('single NT tile', t => {
//     setupTiles();
//     setupPixiAndTagpro();

//     const map = [
//       [2, 2, 2, 2, 2],
//       [2, 2, 2, 2, 2],
//       [2, 2, 10, 2, 2],
//       [2, 2, 2, 2, 2],
//       [2, 2, 2, 2, 2],
//     ];
//     initNavMesh(map, false);
//     const dtGraph = getDTGraph();

//     t.is(dtGraph.numFixedEdges(), 8);
//     t.is(dtGraph.numEdges(), 27);
//     t.is(dtGraph.numTriangles(), 17);

//     map[2][2] = '10.1';
//     updateUnmergedGraph(getUnmergedGraph(), map, 2, 2);
//     const { unfixEdges, constrainingEdges, removeVertices, addVertices } =
//       updateMergedGraph(getMergedGraph(), getUnmergedGraph(), map, 2, 2);
//     dtGraph.dynamicUpdate(unfixEdges, constrainingEdges, removeVertices, addVertices);

//     t.is(unfixEdges.length, 4);
//     t.is(constrainingEdges.length, 0);
//     t.is(removeVertices.length, 4);
//     t.is(addVertices.length, 0);
//     t.is(dtGraph.numTriangles(), 9);
//     t.is(dtGraph.numVertices(), 7);
//     t.is(dtGraph.numEdges(), 15);
//     t.is(dtGraph.numFixedEdges(), 4);

//     teardownTiles();
//     resetPixiAndTagpro();

//     t.end();
//   });
// });


test('getClearancePoint()', tester => {
  tester.test('works for top-left clearance', t => {
    TriangleGraphRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, -1);
    const nextPoint = new Point(-1, 0);

    setupPixiAndTagpro();

    const tGraph = new TriangleGraph();
    tGraph.addVertex(cornerPoint);
    tGraph.addVertex(prevPoint);
    tGraph.addVertex(nextPoint);
    tGraph.addFixedEdge(new Edge(cornerPoint, prevPoint));
    tGraph.addFixedEdge(new Edge(cornerPoint, nextPoint));

    const clearancePoint = tGraph.getClearancePoint(cornerPoint);
    const expected = new Point(1, 1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    TriangleGraphRewireAPI.__ResetDependency__('CLEARANCE');
    resetPixiAndTagpro();

    t.end();
  });


  tester.test('works for top-right clearance', t => {
    TriangleGraphRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, -1);
    const nextPoint = new Point(1, 0);

    setupPixiAndTagpro();

    const tGraph = new TriangleGraph();
    tGraph.addVertex(cornerPoint);
    tGraph.addVertex(prevPoint);
    tGraph.addVertex(nextPoint);
    tGraph.addFixedEdge(new Edge(cornerPoint, prevPoint));
    tGraph.addFixedEdge(new Edge(cornerPoint, nextPoint));

    const clearancePoint = tGraph.getClearancePoint(cornerPoint);
    const expected = new Point(-1, 1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    TriangleGraphRewireAPI.__ResetDependency__('CLEARANCE');
    resetPixiAndTagpro();

    t.end();
  });


  tester.test('works for bottom-left clearance', t => {
    TriangleGraphRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, 1);
    const nextPoint = new Point(1, 0);

    setupPixiAndTagpro();

    const tGraph = new TriangleGraph();
    tGraph.addVertex(cornerPoint);
    tGraph.addVertex(prevPoint);
    tGraph.addVertex(nextPoint);
    tGraph.addFixedEdge(new Edge(cornerPoint, prevPoint));
    tGraph.addFixedEdge(new Edge(cornerPoint, nextPoint));

    const clearancePoint = tGraph.getClearancePoint(cornerPoint);
    const expected = new Point(-1, -1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    TriangleGraphRewireAPI.__ResetDependency__('CLEARANCE');
    resetPixiAndTagpro();

    t.end();
  });


  tester.test('works for bottom-right clearance', t => {
    TriangleGraphRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, 1);
    const nextPoint = new Point(-1, 0);

    setupPixiAndTagpro();

    const tGraph = new TriangleGraph();
    tGraph.addVertex(cornerPoint);
    tGraph.addVertex(prevPoint);
    tGraph.addVertex(nextPoint);
    tGraph.addFixedEdge(new Edge(cornerPoint, prevPoint));
    tGraph.addFixedEdge(new Edge(cornerPoint, nextPoint));

    const clearancePoint = tGraph.getClearancePoint(cornerPoint);
    const expected = new Point(1, -1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    TriangleGraphRewireAPI.__ResetDependency__('CLEARANCE');
    resetPixiAndTagpro();

    t.end();
  });
});
