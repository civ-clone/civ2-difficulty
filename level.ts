import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { King, Warlord } from './Difficulties';
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

/** Who knows an advance: any human player, any computer player (the barbarians among them). */
export interface Known {
  human: boolean;
  computer: boolean;
}

/**
 * What the computer players' late-game rows depend on, as the game stands: the turn, whether a human leads the power
 * ranking (`game.civ_by_rank[7]`, the strongest civilization, by `civ.cpp` `civ_update_power_ranks`), whether the
 * Manhattan Project and the Apollo Program have ever been built (`game.wonder_city[...] != -1`, which a Wonder lost with
 * its city still is), and who knows Rocketry, Nuclear Fission and Space Flight (`game.advance_known_by`). `lateGame`
 * reads it from a game.
 */
export interface LateGame {
  turn: number;
  humanLeads: boolean;
  manhattanProject: boolean;
  apolloProgram: boolean;
  rocketry: Known;
  nuclearFission: Known;
  spaceFlight: Known;
}

/** The last turn on which the computer players' food box rows are left alone (`200 < game.turn` takes them off). */
export const FOOD_ROWS_UNTIL = 200;

/** The last turn on which their shield rows are left alone: one turn earlier than the food rows (`199 < game.turn`). */
export const SHIELD_ROWS_UNTIL = 199;

/**
 * How many rows the game takes off a computer player's food or shield box late in the game, 0 to 2 (OpenCiv2
 * `src/auto/city.cpp` `city_calc_food_box_rows` and `city_calc_unit_support`, richardpenman/civ2@49f26ec): after turn
 * `until`, above Warlord, while a human leads the power ranking, 2; if the Manhattan Project has been built and a computer
 * player knows Rocketry, 1, or none if no human knows Rocketry or none knows Nuclear Fission; then 1 fewer if the Apollo
 * Program has been built and a computer player knows Space Flight, or 2 fewer if no human knows it.
 */
export const lateRows = (
  level: number,
  late: LateGame,
  until: number
): number => {
  if (late.turn <= until || level <= Warlord.level() || !late.humanLeads) {
    return 0;
  }

  let rows = 2;

  if (late.manhattanProject && late.rocketry.computer) {
    rows = 1;

    if (!late.rocketry.human || !late.nuclearFission.human) {
      rows = 0;
    }
  }

  if (late.apolloProgram && late.spaceFlight.computer) {
    rows -= late.spaceFlight.human ? 1 : 2;
  }

  return Math.min(Math.max(rows, 0), 2);
};

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
 * Given `late` (`lateGame`), the rows `lateRows` takes off after turn 200 go before the @COSMIC scaling, as in the code.
 */
export const foodBoxRows = (
  level: number,
  human: boolean,
  late?: LateGame
): number => {
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

  if (late) {
    rows -= lateRows(level, late, FOOD_ROWS_UNTIL);
  }

  return scaled(rows, cosmic.foodBoxRows);
};

/**
 * How many rows a city's shield box has, which multiplies every build cost (OpenCiv2 `src/auto/city.cpp`
 * `city_calc_unit_support`, richardpenman/civ2@49f26ec): @COSMIC's 10 for the human, and for the computer players 13 − level, 14 on
 * Chieftain, and 1 more below King: 15, 13, 12, 10, 9 and 8. Given `late` (`lateGame`), the rows `lateRows` takes off
 * come off from turn 200, one turn before the food rows', and before the @COSMIC scaling.
 */
export const shieldRows = (
  level: number,
  human: boolean,
  late?: LateGame
): number => {
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

  if (late) {
    rows -= lateRows(level, late, SHIELD_ROWS_UNTIL);
  }

  return scaled(rows, cosmic.shieldBoxRows);
};
