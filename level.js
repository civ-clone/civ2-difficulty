"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shieldRows = exports.foodBoxRows = exports.lateRows = exports.SHIELD_ROWS_UNTIL = exports.FOOD_ROWS_UNTIL = exports.levelOf = void 0;
const Difficulties_1 = require("./Difficulties");
const level_1 = require("@civ-clone/base-difficulty/lib/level");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
/**
 * The level a game is played at, 0 (Chieftain) to 5 (Deity).
 *
 * A game with no level set (one a host started without asking, or a test) plays at King, as Civ1's does: the level at
 * which the computer players' box rows are the human's (10).
 */
const levelOf = (gameDifficultyRegistry) => (0, level_1.default)(gameDifficultyRegistry, Difficulties_1.King);
exports.levelOf = levelOf;
/** The last turn on which the computer players' food box rows are left alone (`200 < game.turn` takes them off). */
exports.FOOD_ROWS_UNTIL = 200;
/** The last turn on which their shield rows are left alone: one turn earlier than the food rows (`199 < game.turn`). */
exports.SHIELD_ROWS_UNTIL = 199;
/**
 * How many rows the game takes off a computer player's food or shield box late in the game, 0 to 2 (OpenCiv2
 * `src/auto/city.cpp` `city_calc_food_box_rows` and `city_calc_unit_support`, richardpenman/civ2@49f26ec): after turn
 * `until`, above Warlord, while a human leads the power ranking, 2; if the Manhattan Project has been built and a computer
 * player knows Rocketry, 1, or none if no human knows Rocketry or none knows Nuclear Fission; then 1 fewer if the Apollo
 * Program has been built and a computer player knows Space Flight, or 2 fewer if no human knows it.
 */
const lateRows = (level, late, until) => {
    if (late.turn <= until || level <= Difficulties_1.Warlord.level() || !late.humanLeads) {
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
exports.lateRows = lateRows;
// A computer player's rows, scaled when @COSMIC's rows aren't 10, and then made even, as the game does (OpenCiv2
//  `src/auto/city.cpp` `city_calc_food_box_rows` and `city_calc_unit_support`, richardpenman/civ2@49f26ec).
const scaled = (rows, cosmicRows) => {
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
const foodBoxRows = (level, human, late) => {
    if (human) {
        return cosmic_1.default.foodBoxRows;
    }
    let rows = 13 - level;
    if (level < Difficulties_1.King.level()) {
        rows = 14 - level;
    }
    if (level === 0) {
        rows++;
    }
    if (late) {
        rows -= (0, exports.lateRows)(level, late, exports.FOOD_ROWS_UNTIL);
    }
    return scaled(rows, cosmic_1.default.foodBoxRows);
};
exports.foodBoxRows = foodBoxRows;
/**
 * How many rows a city's shield box has, which multiplies every build cost (OpenCiv2 `src/auto/city.cpp`
 * `city_calc_unit_support`, richardpenman/civ2@49f26ec): @COSMIC's 10 for the human, and for the computer players 13 − level, 14 on
 * Chieftain, and 1 more below King: 15, 13, 12, 10, 9 and 8. Given `late` (`lateGame`), the rows `lateRows` takes off
 * come off from turn 200, one turn before the food rows', and before the @COSMIC scaling.
 */
const shieldRows = (level, human, late) => {
    if (human) {
        return cosmic_1.default.shieldBoxRows;
    }
    let rows = 13 - level;
    if (level === 0) {
        rows = 14;
    }
    if (level < Difficulties_1.King.level()) {
        rows++;
    }
    if (late) {
        rows -= (0, exports.lateRows)(level, late, exports.SHIELD_ROWS_UNTIL);
    }
    return scaled(rows, cosmic_1.default.shieldBoxRows);
};
exports.shieldRows = shieldRows;
//# sourceMappingURL=level.js.map