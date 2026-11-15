"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const buildCost_1 = require("@civ-clone/base-difficulty/lib/buildCost");
const lateGame_1 = require("../../lib/lateGame");
const level_1 = require("../../level");
const BuildCostModifier_1 = require("@civ-clone/core-city-build/Rules/BuildCostModifier");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
// A computer player's city builds against its own shield rows (`shieldRows`, with the rows taken off late in the game,
//  `lateGame`), where the human's are 10: costs are listed for 10 rows, so a computer player pays rows / 10 of each.
const getRules = (gameDifficultyRegistry = GameDifficultyRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, lateGameDependencies = {}) => {
    const late = (0, lateGame_1.default)({
        ...lateGameDependencies,
        clientRegistry,
        gameDifficultyRegistry,
    });
    return [
        new BuildCostModifier_1.default('civ2-difficulty:city/build-cost/computer', new Criterion_1.default((0, buildCost_1.isComputerCity)(clientRegistry)), new Effect_1.default((0, buildCost_1.computerBuildCost)(() => (0, level_1.shieldRows)((0, level_1.levelOf)(gameDifficultyRegistry), false, late())))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-cost.js.map