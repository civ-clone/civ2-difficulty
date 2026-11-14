import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { King } from './Difficulties';
import baseLevelOf from '@civ-clone/base-difficulty/lib/level';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';

/**
 * The level a game is played at, 0 (Chieftain) to 5 (Deity).
 *
 * A game with no level set (one a host started without asking, or a test) plays at King, as Civ1's does: the level at
 * which the computer players' box rows are the human's (10).
 */
export const levelOf = (
  gameDifficultyRegistry: GameDifficultyRegistry
): number => baseLevelOf(gameDifficultyRegistry, King);

// A computer player's rows, scaled when @COSMIC's rows aren't 10, and then made even, as the game does (OpenCiv2
//  `src/auto/city.cpp` `city_calc_food_box_rows` and `city_calc_unit_support`, richardpenman/civ2@49f26ec).
const scaled = (rows: number, cosmicRows: number): number => {
  if (cosmicRows === 10) {
    return rows;
  }

  const scaledRows = Math.trunc((cosmicRows * rows) / 10);

  return scaledRows % 2 === 1 ? scaledRows + 1 : scaledRows;
};

/**
 * How many rows a city's food box has, which its size + 1 multiplies to give the food it needs to grow (OpenCiv2
 * `src/auto/city.cpp` `city_calc_food_box_rows`, richardpenman/civ2@49f26ec): @COSMIC's 10 for the human, and for the computer players
 * 13 − level, 1 more below King and 1 more again on Chieftain: 15, 13, 12, 10, 9 and 8.
 *
 * After turn 200, above Warlord, the game takes up to 2 more rows off the computer players while a human leads the
 * power ranking, fewer once a computer player knows Rocketry with the Manhattan Project built, or Space Flight with the
 * Apollo Program. That isn't here: it needs Civ2's advances and wonders.
 */
export const foodBoxRows = (level: number, human: boolean): number => {
  if (human) {
    return cosmic.foodBoxRows;
  }

  let rows = 13 - level;

  if (level < King.level()) {
    rows = 14 - level;
  }

  if (level === 0) {
    rows++;
  }

  return scaled(rows, cosmic.foodBoxRows);
};

/**
 * How many rows a city's shield box has, which multiplies every build cost (OpenCiv2 `src/auto/city.cpp`
 * `city_calc_unit_support`, richardpenman/civ2@49f26ec): @COSMIC's 10 for the human, and for the computer players 13 − level, 14 on
 * Chieftain, and 1 more below King: 15, 13, 12, 10, 9 and 8. The late-game rows taken off are left out, as for
 * `foodBoxRows` (here from turn 200).
 */
export const shieldRows = (level: number, human: boolean): number => {
  if (human) {
    return cosmic.shieldBoxRows;
  }

  let rows = 13 - level;

  if (level === 0) {
    rows = 14;
  }

  if (level < King.level()) {
    rows++;
  }

  return scaled(rows, cosmic.shieldBoxRows);
};
