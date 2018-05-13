import _ from 'lodash';
import work from 'webworkify-webpack';

import { assert, boundValue } from '../global/utils';
import { Point } from '../global/class/Point';
import { Vector } from '../global/class/Vector';
import { getPlayerCenter } from '../look/playerLocations';
import { FPS, ACCEL, MAX_SPEED } from './constants';
import { Matrix } from './class/Matrix';


const lqrWorker = work(require.resolve('./lqr.worker.js'));
let currentGoalState;
let currentKs;


lqrWorker.addEventListener('message', ev => {
  if (ev.data.text === 'DONE') {
    currentKs = (new Matrix()).fromObject(JSON.parse(ev.data.Ks));
  }
});


/**
 * @param {PolypointState[]} path - a list of states returned by getShortestPolypointPath()
 * @param {{x: number, y: number}} me - the object from tagpro.players, storing x and y pixel
 *   locations
 * @returns {{x: number, y: number, vx: number, vy: number}} the next goal state for our local
 *   controller
 */
export function getLocalGoalStateFromPath(path, me) {
  if (_.isNull(path)) {
    console.warn('Shortest path was null, using own location and zero velocity as localGoalState');
    const myCenter = getPlayerCenter(me);
    return { x: myCenter.x, y: myCenter.y, vx: 0, vy: 0 };
  }
  const pathLength = path.length;
  assert(pathLength > 1, `Shortest path was length ${pathLength}`);
  if (pathLength === 2) {
    const finalNode = path[1].point;
    return { x: finalNode.x, y: finalNode.y, vx: 0, vy: 0 };
  }
  const nextNode = path[1].point;
  const nextNextNode = path[2].point;
  const nodeDiff = nextNextNode.subtract(nextNode);
  // Max velocity from nextNode to nextNextNode
  const maxVel = new Vector(nodeDiff.x, nodeDiff.y).scaleToMax(MAX_SPEED);
  return { x: nextNode.x, y: nextNode.y, vx: maxVel.x, vy: maxVel.y };
}


/**
 * @param {{x: number, y: number, vx: number, vy: number}} initialState
 * @param {{x: number, y: number, vx: number, vy: number}} goalState
 * @returns {number} the best guess for the number of frames it will take to reach the goal state
 */
export function determineDeadline(initialState, goalState) {
  const initialPoint = new Point(initialState.x, initialState.y);
  const goalPoint = new Point(goalState.x, goalState.y);

  const distance = initialPoint.distance(goalPoint);
  const seconds = (distance / MAX_SPEED);

  // Floor deadline at two, because we use our deadline to define T, which has to have at least two
  //   timesteps
  return Math.max(Math.floor(FPS * seconds), 2);
}


/**
 * @param {{x: number, y: number, vx: number, vy: number}} initialState
 * @param {{x: number, y: number, vx: number, vy: number}} goalState
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers to reach the
 *   destination. The positive directions are down and right.
 */
export function getLQRAccelerationMultipliers(initialState, goalState) {
  const iStateMatrix = new Matrix([
    [initialState.x],
    [initialState.vx],
    [initialState.y],
    [initialState.vy],
  ]);
  const gStateMatrix = new Matrix([
    [goalState.x],
    [goalState.vx],
    [goalState.y],
    [goalState.vy],
  ]);

  const deadline = determineDeadline(initialState, goalState);

  if (!gStateMatrix.equals(currentGoalState)) {
    // There is a new goal state
    lqrWorker.postMessage({ text: 'RECALCULATE_K_MATRICES', goalState, deadline });
    currentGoalState = gStateMatrix;
  }

  // Calculated insufficient K matrices and should recalculate
  if (!currentKs || currentKs.shape()[0] <= 1) {
    lqrWorker.postMessage({ text: 'RECALCULATE_K_MATRICES', goalState, deadline });
    currentGoalState = gStateMatrix;
    return { accX: 0, accY: 0 };
  }

  const maxDeadline = currentKs.shape()[0] - 1;
  const KIndex = boundValue(maxDeadline - deadline, 1, maxDeadline);

  const x = iStateMatrix.subtract(gStateMatrix);
  x.append([[1]]);
  const u = currentKs.get(KIndex).scalarMultiply(-1).dot(x); // [[ax], [ay]]
  const uRelative = u.scalarMultiply(1 / ACCEL);

  // Scale to max acceleration at 1 or -1
  const accVector = new Vector(
    uRelative.getValue(0, 0),
    uRelative.getValue(1, 0),
  ).scaleToMax(1);

  return { accX: accVector.x, accY: accVector.y };
}
