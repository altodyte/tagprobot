import { PPTL } from './constants';
import { getMapTraversabilityInCells } from './helpers/map';
import {
  findMyEndzone,
  findEnemyEndzone,
  findFlagStation,
  // findEnemy, // TODO: Commenting this out until juking is implemented
  findEnemyFC,
} from './helpers/finders';
import { myTeamHasFlag, enemyTeamHasFlag } from './helpers/gameState';
import { getMe } from './helpers/player';
import { getShortestPath, getTarget } from './helpers/path';
import { move } from './utils/interface';

/*
 * The logic/flowchart to get where our goal is.
 *   If I have the flag, go to my endzone.
 *   If an enemy in view has the flag, chase him.
 *   If the enemy team has the flag but I can't see them, go to their endzone.
 *   If we have the flag, go to our endzone.
 *   Else, go to the flag station.
 */
function getGoal() {
  let goal;
  const me = getMe();
  // If the bot has the flag, go to the endzone
  if (me.flag) {
    // const chaser = findEnemy();
    // really bad jukes! TODO: either remove or integrate this
    // if (chaser) {
    //   goal = chaser;
    //   goal.x = (2 * (me.x + me.vx)) - (chaser.x + chaser.vx);
    //   goal.y = (2 * (me.y + me.vy)) - (chaser.y + chaser.vy);
    //   console.log('I have the flag. Fleeing enemy!');
    // }
    goal = findMyEndzone();
    console.log('I have the flag. Seeking endzone!');
  } else {
    const enemyFC = findEnemyFC();
    if (enemyFC) { // If an enemy player in view has the flag, chase
      goal = enemyFC;
      goal.x = enemyFC.x + enemyFC.vx;
      goal.y = enemyFC.y + enemyFC.vy;
      console.log('I see an enemy with the flag. Chasing!');
    } else if (enemyTeamHasFlag()) {
      goal = findEnemyEndzone();
      console.log('Enemy has the flag. Headed towards the Enemy Endzone.');
    } else if (myTeamHasFlag()) {
      goal = findMyEndzone();
      console.log('We have the flag. Headed towards our Endzone.');
    } else {
      goal = findFlagStation();
      console.log("I don't know what to do. Going to central flag station!");
    }
  }
  return goal;
}


/*
 * Gets the x and y displacement that we should move next
 */
function getSeek() {
  const goal = getGoal();
  const me = getMe();

  // Version for attempting path-planning
  const gridPosition = {
    x: Math.floor((me.x + 20) / PPTL),
    y: Math.floor((me.y + 20) / PPTL),
  };
  const gridTarget = {
    x: Math.floor(goal.x / PPTL),
    y: Math.floor(goal.y / PPTL),
  };
  const traversableCells = getMapTraversabilityInCells(tagpro.map);
  const shortestPath = getShortestPath(
    gridPosition.x,
    gridPosition.y,
    gridTarget.x,
    gridTarget.y,
    traversableCells,
  );
  const seekToward = getTarget(
    gridPosition.x,
    gridPosition.y,
    shortestPath,
  );
  seekToward.x *= PPTL;
  seekToward.y *= PPTL;


  // Version for not attempting path-planning
  return {
    x: seekToward.x - (me.x + me.vx),
    y: seekToward.y - (me.y + me.vy),
  };
}

export default function botLoop() {
  move(getSeek());
}
