import _ from 'lodash';

import { assert, determinant } from '../global/utils';


/**
 * @param {Point} A
 * @param {Point} B
 * @param {Point} P
 * @returns {number} a number which is positive iff P is on the left of the edge AB
 */
export function detD(A, B, P) {
  return determinant([
    [A.x, A.y, 1],
    [B.x, B.y, 1],
    [P.x, P.y, 1],
  ]);
}


/**
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} E
 * @returns {number} a number which is positive iff D is inside the circumcircle of points A, B, C
 */
export function detH(A, B, C, D) {
  return determinant([
    [A.x, A.y, (A.x ** 2) + (A.y ** 2), 1],
    [B.x, B.y, (B.x ** 2) + (B.y ** 2), 1],
    [C.x, C.y, (C.x ** 2) + (C.y ** 2), 1],
    [D.x, D.y, (D.x ** 2) + (D.y ** 2), 1],
  ]);
}


/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @returns {boolean} true if all points are colinear
 */
export function threePointsInLine(p1, p2, p3) {
  if (p1.equals(p2) || p1.equals(p3) || p2.equals(p3)) return true;
  const x1 = p2.x - p1.x;
  const x2 = p2.x - p3.x;
  const y1 = p2.y - p1.y;
  const y2 = p2.y - p3.y;
  if (x1 === 0 || x2 === 0) return x1 === x2;
  // Use line slopes to calculate if all three points are in a line
  return y1 * x2 === y2 * x1;
}


/**
 * Adapted from: https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
 * @param {Point[]} points
 * @param {Point} inputCenter - an optional input point to sort points around
 * @returns {Point[]} the points sorted in counter clockwise order around the center-of-mass of
 *   these points, or the specified input center, starting at 12 o'clock
 */
export function sortCounterClockwise(points, inputCenter) {
  const center = inputCenter || {
    x: _.sumBy(points, 'x') / points.length,
    y: _.sumBy(points, 'y') / points.length,
  };
  return points.sort((a, b) => {
    if (a.x - center.x >= 0 && b.x - center.x < 0) return true;
    if (a.x - center.x < 0 && b.x - center.x >= 0) return false;
    if (a.x - center.x === 0 && b.x - center.x === 0) {
      if (a.y - center.y >= 0 || b.y - center.y >= 0) return a.y > b.y;
      return b.y > a.y;
    }

    // Compute the cross product of vectors (center -> a) x (center -> b)
    const det = ((a.x - center.x) * (b.y - center.y)) - ((b.x - center.x) * (a.y - center.y));
    if (det < 0) return true;
    if (det > 0) return false;

    // Points a and b are on the same line from the center
    // Check which point is closer to the center
    const d1 = ((a.x - center.x) * (a.x - center.x)) + ((a.y - center.y) * (a.y - center.y));
    const d2 = ((b.x - center.x) * (b.x - center.x)) + ((b.y - center.y) * (b.y - center.y));
    return d1 > d2;
  });
}


/**
 * @param {Triangle[]} intersectingTriangles - array of triangles that intersect the edge
 * @param {Edge} e
 * @returns {{upperPoints: Point[], lowerPoints: Point[]}} the ordered points of the upper and lower
 *   regions that share the edge
 */
export function findUpperAndLowerPoints(intersectingTriangles, e) {
  let triangles = intersectingTriangles;
  // Keep track of the points in order in the regions above and below the edge
  const upperPoints = [e.p1];
  const lowerPoints = [e.p1];

  while (!_.isEmpty(triangles)) {
    const lastUpperPoint = _.last(upperPoints);
    const lastLowerPoint = _.last(lowerPoints);

    // Find next triangle
    const nextT = _.find(triangles, t => (
      t.hasPoint(lastUpperPoint) && t.hasPoint(lastLowerPoint)
    ));

    assert(!_.isNil(nextT), 'Could not find triangle containing both last upper and last lower');

    // Add points to upperPoints and lowerPoints
    if (upperPoints.length === 1) {
      // This is the first triangle, add one point to upper polygon and the other to lower
      const newPoints = _.reject(nextT.getPoints(), p => p.equals(lastUpperPoint));
      upperPoints.push(newPoints[0]);
      lowerPoints.push(newPoints[1]);
    } else {
      // Get the third point that's not in either pseudo-polygon
      const newPoint = _.find(nextT.getPoints(), p => (
        !p.equals(lastUpperPoint) && !p.equals(lastLowerPoint)
      ));

      if (newPoint.equals(e.p2)) {
        // This is the last point, add it to both regions
        upperPoints.push(newPoint);
        lowerPoints.push(newPoint);
      } else {
        // Push point to either upper or lower region
        if (e.onSameSideOfPoints(newPoint, lastUpperPoint)) upperPoints.push(newPoint);
        else lowerPoints.push(newPoint);
      }
    }

    // Remove triangle and edges from graph and from triangles
    triangles = _.reject(triangles, nextT);
  }
  return { upperPoints, lowerPoints };
}
