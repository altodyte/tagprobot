import test from 'tape';
import keys from 'lodash/keys';
import values from 'lodash/values';
import forEach from 'lodash/forEach';
import has from 'lodash/has';
import sinon from 'sinon';
import _ from 'lodash';

import {
  computeTileInfo,
  getTileProperty,
  tileHasName,
  tileHasProperty,
  tileIsOneOf,
  __RewireAPI__ as TileRewireAPI,
} from '../src/tiles';
import { teams } from '../src/constants';
import { assert } from '../src/utils/asserts';

// functions for setup and teardown tests begin here

/*
 * @param {number} teamColor - 1 for red, 2 for blue
 */
export function setupTiles(teamColor) {
  assert(_.includes([teams.RED, teams.BLUE], teamColor), `${teamColor} is not a team color`);
  const mockTileInfo = {
    EMPTY_SPACE: { id: 0, traversable: false, permanent: true },
    SQUARE_WALL: { id: 1, traversable: false, permanent: true },
    ANGLE_WALL_1: { id: 1.1, traversable: false, permanent: true },
    ANGLE_WALL_2: { id: 1.2, traversable: false, permanent: true },
    ANGLE_WALL_3: { id: 1.3, traversable: false, permanent: true },
    ANGLE_WALL_4: { id: 1.4, traversable: false, permanent: true },
    REGULAR_FLOOR: { id: 2, traversable: true, permanent: true },
    RED_FLAG: { id: 3, traversable: true, permanent: false },
    RED_FLAG_TAKEN: { id: '3.1', traversable: true, permanent: false },
    BLUE_FLAG: { id: 4, traversable: true, permanent: false },
    BLUE_FLAG_TAKEN: { id: '4.1', traversable: true, permanent: false },
    SPEEDPAD_ACTIVE: { id: 5, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_INACTIVE: { id: '5.1', traversable: true, permanent: false },
    POWERUP_SUBGROUP: { id: 6, traversable: false, radius: 15, permanent: false },
    JUKEJUICE: { id: 6.1, traversable: false, radius: 15, permanent: false },
    ROLLING_BOMB: { id: 6.2, traversable: false, radius: 15, permanent: false },
    TAGPRO: { id: 6.3, traversable: false, radius: 15, permanent: false },
    MAX_SPEED: { id: 6.4, traversable: false, radius: 15, permanent: false },
    SPIKE: { id: 7, traversable: false, radius: 14, permanent: true },
    BUTTON: { id: 8, traversable: false, radius: 8, permanent: true },
    INACTIVE_GATE: { id: 9, traversable: true, permanent: false },
    GREEN_GATE: { id: 9.1, traversable: false, permanent: false },
    RED_GATE: { id: 9.2, traversable: teamColor === teams.RED, permanent: false },
    BLUE_GATE: { id: 9.3, traversable: teamColor === teams.BLUE, permanent: false },
    BOMB: { id: 10, traversable: false, radius: 15, permanent: false },
    INACTIVE_BOMB: { id: '10.1', traversable: true, permanent: false },
    RED_TEAMTILE: { id: 11, traversable: true, permanent: true },
    BLUE_TEAMTILE: { id: 12, traversable: true, permanent: true },
    ACTIVE_PORTAL: { id: 13, traversable: false, radius: 15, permanent: false },
    INACTIVE_PORTAL: { id: '13.1', traversable: true, permanent: false },
    SPEEDPAD_RED_ACTIVE: { id: 14, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_RED_INACTIVE: { id: '14.1', traversable: true, permanent: false },
    SPEEDPAD_BLUE_ACTIVE: { id: 15, traversable: false, radius: 15, permanent: false },
    SPEEDPAD_BLUE_INACTIVE: { id: '15.1', traversable: true, permanent: false },
    YELLOW_FLAG: { id: 16, traversable: true, permanent: false },
    YELLOW_FLAG_TAKEN: { id: '16.1', traversable: true, permanent: false },
    RED_ENDZONE: { id: 17, traversable: true, permanent: true },
    BLUE_ENDZONE: { id: 18, traversable: true, permanent: true },
    RED_BALL: { id: 'redball', traversable: true, permanent: false },
    BLUE_BALL: { id: 'blueball', traversable: true, permanent: false },
  };
  const mockTileNames = {};
  keys(mockTileInfo).forEach(key => {
    mockTileNames[mockTileInfo[key].id] = key;
  });
  TileRewireAPI.__Rewire__('tileInfo', mockTileInfo);
  TileRewireAPI.__Rewire__('tileNames', mockTileNames);
}

export function teardownTiles() {
  TileRewireAPI.__ResetDependency__('tileInfo');
  TileRewireAPI.__ResetDependency__('tileNames');
}

// begin actual tests

test('computeTileInfo: stores info in tileInfo', t => {
  const mockTileInfo = {};
  const mockAmRed = sinon.stub().returns(false);
  const mockAmBlue = sinon.stub().returns(true);
  TileRewireAPI.__Rewire__('amBlue', mockAmBlue);
  TileRewireAPI.__Rewire__('amRed', mockAmRed);
  TileRewireAPI.__Rewire__('tileInfo', mockTileInfo);
  computeTileInfo();
  // Check that 40 tiles were stored
  t.is(keys(mockTileInfo).length, 40);
  // Check that all values in tileInfo have an id
  forEach(values(mockTileInfo), value => {
    t.true(has(value, 'id'));
  });
  t.is(mockTileInfo.SPEEDPAD_RED_ACTIVE.radius, 15);
  t.is(mockTileInfo.ANGLE_WALL_2.traversable, false);
  t.is(mockTileInfo.RED_GATE.traversable, false);
  t.is(mockTileInfo.BLUE_GATE.traversable, true);
  t.true(mockAmRed.calledOnce);
  t.true(mockAmBlue.calledOnce);
  t.end();
});


test('getTileProperty: returns correct properties', t => {
  setupTiles(teams.BLUE);
  t.is(getTileProperty(1, 'traversable'), false); // square wall
  t.is(getTileProperty(2, 'traversable'), true); // regular floor
  t.is(getTileProperty(13, 'radius'), 15); // active portal
  teardownTiles();

  t.end();
});


test('getTileProperty: throws error given tileIds that don\'t exist', t => {
  setupTiles(teams.BLUE);
  t.throws(() => { getTileProperty(1.123, 'traversable'); });
  t.throws(() => { getTileProperty(-1, 'traversable'); });
  t.throws(() => { getTileProperty('potato', 'traversable'); });
  t.throws(() => { getTileProperty('NONEXISTENT_TILE', 'traversable'); });
  teardownTiles();

  t.end();
});


test('getTileProperty: throws error given properties that don\'t exist', t => {
  setupTiles(teams.BLUE);
  t.throws(() => { getTileProperty(0, 'potato'); });
  t.throws(() => { getTileProperty('4.1', 'radius'); }); // blue flag taken
  teardownTiles();

  t.end();
});


test('getTileProperty: throws error when input id is wrong data type', t => {
  setupTiles(teams.BLUE);
  t.throws(() => { getTileProperty('1', 'traversable'); });
  t.throws(() => { getTileProperty('1.1', 'traversable'); });
  t.throws(() => { getTileProperty(5.1, 'traversable'); });
  teardownTiles();

  t.end();
});


test('tileHasProperty: checks if a tile has a property', t => {
  setupTiles(teams.BLUE);
  t.true(tileHasProperty('4.1', 'permanent')); // blue flag taken
  t.true(tileHasProperty(6.1, 'radius')); // juke juice
  t.false(tileHasProperty(0, 'radius')); // empty space
  t.false(tileHasProperty(2, 'radius')); // regular floor
  teardownTiles();

  t.end();
});


test('tileHasProperty: throws error when input id is wrong data type', t => {
  setupTiles(teams.BLUE);
  t.throws(() => { tileHasProperty('1', 'traversable'); });
  t.throws(() => { tileHasProperty('1.1', 'traversable'); });
  t.throws(() => { tileHasProperty(5.1, 'traversable'); });
  teardownTiles();

  t.end();
});


test('tileHasName: returns true when tileId and name match', t => {
  setupTiles(teams.BLUE);
  t.ok(tileHasName(1.1, 'ANGLE_WALL_1'));
  t.ok(tileHasName(4, 'BLUE_FLAG'));
  t.ok(tileHasName('5.1', 'SPEEDPAD_INACTIVE'));
  t.ok(tileHasName('16.1', 'YELLOW_FLAG_TAKEN'));
  t.ok(tileHasName(18, 'BLUE_ENDZONE'));
  teardownTiles();

  t.end();
});


test('tileHasName: returns false when tileId and name do not match', t => {
  setupTiles(teams.BLUE);
  t.notOk(tileHasName(1, 'ANGLE_WALL_1'));
  t.notOk(tileHasName(4, 'RED_FLAG'));
  t.notOk(tileHasName(5.1, 'SPEEDPAD_INACTIVE'));
  t.notOk(tileHasName('16', 'YELLOW_FLAG_TAKEN'));
  t.notOk(tileHasName(17, 'BLUE_ENDZONE'));
  teardownTiles();

  t.end();
});


test('tileHasName: errors when name is not a tile', t => {
  setupTiles(teams.BLUE);
  t.throws(() => { tileHasName(1, undefined); });
  t.throws(() => { tileHasName(1, 'potato'); });
  t.throws(() => { tileHasName(1, 'toid'); });
  t.throws(() => { tileHasName(1, ''); });
  t.throws(() => { tileHasName(1, 1); });
  teardownTiles();

  t.end();
});


test('tileIsOneOf: returns true when tile\'s name is in names', t => {
  setupTiles(teams.BLUE);
  t.ok(tileIsOneOf(0, ['EMPTY_SPACE', 'SPIKE', 'INACTIVE_PORTAL'])); // empty space
  t.ok(tileIsOneOf(7, ['EMPTY_SPACE', 'SPIKE', 'INACTIVE_PORTAL'])); // spike
  t.ok(tileIsOneOf('13.1', ['EMPTY_SPACE', 'SPIKE', 'INACTIVE_PORTAL'])); // inactive_portal
  teardownTiles();

  t.end();
});


test('tileIsOneOf: returns false when tile\'s name is in names', t => {
  setupTiles(teams.BLUE);
  t.notOk(tileIsOneOf(2, ['EMPTY_SPACE', 'SPIKE', 'INACTIVE_PORTAL']));
  t.notOk(tileIsOneOf(8, ['EMPTY_SPACE', 'SPIKE', 'INACTIVE_PORTAL']));
  t.notOk(tileIsOneOf(13.1, ['EMPTY_SPACE', 'SPIKE', 'INACTIVE_PORTAL']));
  teardownTiles();

  t.end();
});
