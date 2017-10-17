import { PPCL, BRP, lookahead } from './constants';
import { getMapTraversabilityInCells } from './helpers/map';
import { findTile, findEnemyFC } from './helpers/finders';
import { myTeamHasFlag, enemyTeamHasFlag } from './helpers/gameState';
import { getMe, amBlue, amRed } from './helpers/player';
import { getShortestPath } from './helpers/path';
import { isAutonomousMode, isVisualMode, move, dequeueChatMessages } from './utils/interface';
import { updatePath } from './draw/drawings';
import { desiredAccelerationMultiplier } from './helpers/physics';


/**
 * The logic/flowchart to get where our goal is.
 *   If I have the flag, go to my endzone.
 *   If an enemy in view has the flag, chase him.
 *   If the enemy team has the flag but I can't see them, go to their endzone.
 *   If we have the flag, go to our endzone.
 *   Else, go to the flag station.
 * @returns {{x: number, y: number}} the position, in pixels, of the bot's goal, which is
 *   determined by the current state of the game
 */
function getGoalPos() {
  const me = getMe();
  let goal;

  // If the bot has the flag, go to the endzone
  if (me.flag) {
    goal = amRed() ? { x: 1320, y: 1360 } : { x: 440, y: 400 };

    console.log('I have the flag. Seeking endzone!');
  } else {
    const enemyFC = findEnemyFC();
    if (enemyFC) { // If an enemy player in view has the flag, chase
      goal = enemyFC;
      goal.x = enemyFC.x + enemyFC.vx;
      goal.y = enemyFC.y + enemyFC.vy;
      console.log('I see an enemy with the flag. Chasing!');
    } else if (enemyTeamHasFlag()) {
      goal = amBlue() ? { x: 1360, y: 1360 } : { x: 400, y: 400 };
      console.log('Enemy has the flag. Headed towards the Enemy Endzone.');
    } else if (myTeamHasFlag()) {
      goal = amRed() ? { x: 1360, y: 1360 } : { x: 400, y: 400 };
      console.log('We have the flag. Headed towards our Endzone.');
    } else {
      goal = findTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
      console.log("I don't know what to do. Going to central flag station!");
    }
  }

  return goal;
}


/**
 * @returns {{accX: number, accY: number}} The desired acceleration multipliers the bot should
 *   achieve with arrow key presses. Positive directions are down and right.
 */
function getAccelValues() {
  const { map } = tagpro;
  const me = getMe();

  const goal = getGoalPos();
  me.xc = Math.floor((me.x + (PPCL / 2)) / PPCL);
  me.yc = Math.floor((me.y + (PPCL / 2)) / PPCL);

  const finalTarget = {
    xc: Math.floor(goal.x / PPCL),
    yc: Math.floor(goal.y / PPCL),
  };
  // Runtime: O(M*CPTL^2) with visualizations on, O(M + S*CPTL^2) with visualizations off
  const traversableCells = getMapTraversabilityInCells(map);

  // TODO: runtime of this? Call is O(R) for now
  const shortestPath = getShortestPath(
    { xc: me.xc, yc: me.yc },
    { xc: finalTarget.xc, yc: finalTarget.yc },
    traversableCells,
  );
  // Runtime: O(A), O(1) if visualizations off
  updatePath(shortestPath);

  const targetPixels = { xp: me.x + BRP, yp: me.y + BRP };
  if (shortestPath) {
    const targetCell = shortestPath[Math.min(lookahead, shortestPath.length - 1)];
    targetPixels.xp = Math.floor((targetCell.xc + 0.5) * PPCL);
    targetPixels.yp = Math.floor((targetCell.yc + 0.5) * PPCL);
  } else {
    console.log('Shortest path was null, using own location as target');
  }

  return desiredAccelerationMultiplier(
    me.x + BRP, // the x center of our ball, in pixels
    me.y + BRP, // the y center of our ball, in pixels
    me.vx, // our v velocity
    me.vy, // our y velocity
    targetPixels.xp, // the x we are seeking toward (pixels)
    targetPixels.yp, // the y we are seeking toward (pixels)
  );
}


/**
 * The base loop for defining the bot's behavior.
 */
export default function botLoop() {
  dequeueChatMessages();
  if (isAutonomousMode()) {
    move(getAccelValues());
  } else if (isVisualMode()) {
    getAccelValues();
  }
}
