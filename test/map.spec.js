import test from 'tape';
import {
  isTraversable,
  fillGridWithSubgrid,
  addBufferTo2dArray,
  getSubarrayFrom2dArray,
  traversableCellsInTile,
  getTraversableCells,
  init2dArray,
  multiplyCorrespondingElementsAndSum,
  convolve,
  __RewireAPI__ as MapRewireAPI,
} from '../src/helpers/map';
import { tileTypes } from '../src/constants';


test('isTraversable: returns correct values for varying inputs', t => {
  t.true(isTraversable(2)); // Regular floor
  t.true(isTraversable(3.1)); // taken red flag
  t.true(isTraversable(9)); // inactive gate
  t.true(isTraversable(17)); // red endzone
  t.false(isTraversable(0)); // Blank space
  t.false(isTraversable(1)); // square wall
  t.false(isTraversable(7)); // spike

  t.end();
});


test('isTraversable: throws errors for invalid inputs', t => {
  t.throws(() => { isTraversable(1.123); });
  t.throws(() => { isTraversable(-1); });
  t.throws(() => { isTraversable('potato'); });
  t.throws(() => { isTraversable(undefined); });
  t.end();
});


test('fillGridWithSubgrid: fills larger grids correctly', t => {
  let grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  let subgrid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  let expected = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  fillGridWithSubgrid(grid, subgrid, 0, 0);
  t.same(grid, expected);

  grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  subgrid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  expected = [
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
  ];
  fillGridWithSubgrid(grid, subgrid, 1, 0);
  t.same(grid, expected);

  t.end();
});


test('fillGridWithSubgrid: throws errors for invalid inputs', t => {
  const grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  const subgrid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  t.throws(() => { fillGridWithSubgrid(grid, subgrid, -1, 1); });
  t.throws(() => { fillGridWithSubgrid(grid, subgrid, 1, 2); });
  t.throws(() => { fillGridWithSubgrid(subgrid, grid, 0, 0); });

  t.end();
});


test('addBufferTo2dArray: correctly adds buffer to grid', t => {
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  const bufSize = 2;
  const bufVal = 1;
  const expected = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 3, 1, 1],
    [1, 1, 4, 5, 6, 1, 1],
    [1, 1, 7, 8, 9, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  t.same(addBufferTo2dArray(matrix, bufSize, bufVal), expected);

  t.end();
});


test('getSubarrayFrom2dArray: returns correct subarray for varying inputs', t => {
  let array = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2],
    [3, 4, 5, 6],
  ];
  let xCenter = 2;
  let yCenter = 2;
  let width = 3;
  let height = 3;
  let expected = [
    [6, 7, 8],
    [0, 1, 2],
    [4, 5, 6],
  ];
  t.same(getSubarrayFrom2dArray(array, xCenter, yCenter, width, height), expected);

  array = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 0, 1, 2],
    [3, 4, 5, 6, 7, 8],
    [9, 0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 0],
  ];
  xCenter = 2;
  yCenter = 1;
  width = 5;
  height = 3;
  expected = [
    [1, 2, 3],
    [7, 8, 9],
    [3, 4, 5],
    [9, 0, 1],
    [5, 6, 7],
  ];
  t.same(getSubarrayFrom2dArray(array, xCenter, yCenter, width, height), expected);

  t.end();
});


test('traversableCellsInTile: returns correctly with traversable tile, CPTL=1', t => {
  MapRewireAPI.__Rewire__('CPTL', 1);
  const expected = [
    [1],
  ];
  t.same(traversableCellsInTile(tileTypes.YELLOW_FLAG), expected);

  t.end();
});


test('traversableCellsInTile: returns correctly with nontraversable tile, CPTL=1', t => {
  MapRewireAPI.__Rewire__('CPTL', 1);
  const expected = [
    [0],
  ];
  t.same(traversableCellsInTile(tileTypes.BOMB), expected);
  t.end();
});


test('traversableCellsInTile: returns correctly with traversable tile, CPTL=4', t => {
  MapRewireAPI.__Rewire__('CPTL', 4);
  const expected = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ];
  t.same(traversableCellsInTile(tileTypes.YELLOW_FLAG), expected);

  t.end();
});


test('traversableCellsInTile: returns correctly with nontraversable tile, CPTL=4', t => {
  const expected = [
    [1, 0, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 0, 0, 1],
  ];
  t.same(traversableCellsInTile(tileTypes.SPIKE), expected);

  t.end();
});


test('traversableCellsInTile: returns correctly with nontraversable tile, CPTL=4', t => {
  const expected = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  t.same(traversableCellsInTile(tileTypes.ACTIVE_PORTAL), expected);
  t.end();
});


test('traversableCellsInTile: returns correctly with nontraversable tile, CPTL=8', t => {
  MapRewireAPI.__Rewire__('CPTL', 8);
  let expected = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  t.same(traversableCellsInTile(tileTypes.BUTTON), expected);

  expected = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  t.same(traversableCellsInTile(tileTypes.SPIKE), expected);

  t.end();
});


test('traversableCellsInTile: throws errors for invalid inputs', t => {
  t.throws(() => { traversableCellsInTile(false); });
  t.throws(() => { traversableCellsInTile(1.23); });
  t.throws(() => { traversableCellsInTile(undefined); });
  t.throws(() => { traversableCellsInTile('apple'); });

  t.end();
});


test('getTraversableCells: returns correctly with CPTL=1', t => {
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = tileTypes.BOMB;
  const spike = tileTypes.SPIKE;
  const redgate = tileTypes.RED_GATE;
  const bluegate = tileTypes.BLUE_GATE;
  const blank = tileTypes.REGULAR_FLOOR;

  // initialize current player as blue
  MapRewireAPI.__Rewire__('amBlue', () => true);
  MapRewireAPI.__Rewire__('amRed', () => false);

  MapRewireAPI.__Rewire__('CPTL', 1);
  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  // this is what we expect the function to return
  let expected = [
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
  ];
  t.same(getTraversableCells(mockMap), expected);

  // initialize current player as red
  MapRewireAPI.__Rewire__('amBlue', () => false);
  MapRewireAPI.__Rewire__('amRed', () => true);
  expected = [
    [0, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];
  t.same(getTraversableCells(mockMap), expected);

  t.end();
});


test('getTraversableCells: CPTL=2', t => {
  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = tileTypes.BOMB;
  const spike = tileTypes.SPIKE;
  const redgate = tileTypes.RED_GATE;
  const bluegate = tileTypes.BLUE_GATE;
  const blank = tileTypes.REGULAR_FLOOR;

  MapRewireAPI.__Rewire__('CPTL', 2);
  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const mockMap = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank  ],
    [blank,   spike,    bomb   ],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  let expected = [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
  ];
  t.same(getTraversableCells(mockMap), expected);

  MapRewireAPI.__Rewire__('CPTL', 10);
  const smallMap = [[bomb, bluegate]];
  // For an object with radius 29, there are no traversable cells.
  // TODO: fix this unit test when we have proper object radii
  // implemented in getTraversableCells
  expected = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  t.same(getTraversableCells(smallMap), expected);

  t.end();
});


test('test init2dArray', t => {
  let width = 5;
  let height = 3;
  let defaultVal = 1;
  let expected = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  t.same(init2dArray(width, height, defaultVal), expected);

  width = 3;
  height = 3;
  defaultVal = 55;
  expected = [
    [55, 55, 55],
    [55, 55, 55],
    [55, 55, 55],
  ];
  t.same(init2dArray(width, height, defaultVal), expected);

  t.end();
});


test('test multiplyCorrespondingElementsAndSum', t => {
  const m1 = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  const m2 = [
    [9, 8, 7],
    [6, 5, 4],
    [3, 2, 1],
  ];

  const expected = 165;

  t.is(multiplyCorrespondingElementsAndSum(m1, m2), expected);

  t.end();
});


test('convolve: input 1x1 kernel', t => {
  let m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  let k = [
    [1],
  ];
  let expected = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  t.same(convolve(m, k), expected);

  m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  k = [
    [2],
  ];
  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  expected = [
    [ 2,  4,  6],
    [ 8, 10, 12],
    [14, 16, 18],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.same(convolve(m, k), expected);

  t.end();
});


test('convolve: input 3x3 kernel', t => {
  const m = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2],
  ];
  const k = [
    [1, 2, 3],
    [3, 4, 5],
    [6, 7, 8],
  ];
  /* eslint-disable no-multi-spaces, array-bracket-spacing */
  const expected = [
    [112, 160, 193, 142],
    [131, 150, 129, 100],
    [ 89,  91,  79,  63],
  ];
  /* eslint-enable no-multi-spaces, array-bracket-spacing */
  t.same(convolve(m, k), expected);

  t.end();
});
