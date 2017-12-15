import _ from 'lodash';
import { pointsOnSameSide } from './graph';

/**
 * @param {Triangle[]} intersectingTriangles - array of triangles that intersect the edge
 * @param {{p1: Point, p2: Point}} e - the edge
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

    // Add points to upperPoints and lowerPoints
    if (upperPoints.length === 1) {
      // This is the first triangle, add one point to upper polygon and the other to lower
      const newPoints = _.reject(nextT.getPoints(), p => p.equal(lastUpperPoint));
      upperPoints.push(newPoints[0]);
      lowerPoints.push(newPoints[1]);
    } else {
      // Get the third point that's not in either pseudo-polygon
      const newPoint = _.find(nextT.getPoints(), p => (
        !p.equal(lastUpperPoint) && !p.equal(lastLowerPoint)
      ));

      if (newPoint.equal(e.p2)) {
        // This is the last point, add it to both regions
        upperPoints.push(newPoint);
        lowerPoints.push(newPoint);
      } else {
        // Push point to either upper or lower region
        if (pointsOnSameSide(newPoint, lastUpperPoint, e)) upperPoints.push(newPoint);
        else lowerPoints.push(newPoint);
      }
    }

    // Remove triangle and edges from graph and from triangles
    triangles = _.reject(triangles, nextT);
  }
  return { upperPoints, lowerPoints };
}


/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @returns {boolean} true if all points are colinear
 */
export function threePointsInLine(p1, p2, p3) {
  const x1 = p2.x - p1.x;
  const x2 = p2.x - p3.x;
  const y1 = p2.y - p1.y;
  const y2 = p2.y - p3.y;
  if (x1 === 0 || x2 === 0) {
    return x1 === x2;
  }
  // Use line slopes to calculate if all three points are in a line
  return y1 * x2 === y2 * x1;
}
