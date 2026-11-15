"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const core_game_1 = require("@civ-clone/core-game");
const strength_1 = require("./Rules/Unit/strength");
const RuleSets_1 = require("./RuleSets");
const RuleSet_1 = require("@civ-clone/core-rule/RuleSet");
const build_cost_1 = require("./Rules/City/build-cost");
const register = (game) => {
    game.rules.register(...(0, build_cost_1.default)(game.difficulty, game.clients, {
        cityImprovementRegistry: game.cityImprovements,
        playerRegistry: game.players,
        playerResearchRegistry: game.playerResearch,
        ruleRegistry: game.rules,
        turn: game.turn,
        wonderRegistry: game.wonders,
    }), ...(0, strength_1.default)(game.difficulty, game.clients));
    // The level's combat handicaps, as a set a game can switch off.
    game.ruleSets.register(new RuleSet_1.default(RuleSets_1.COMBAT_HANDICAPS, strength_1.HUMAN_DEFENDER, strength_1.HUMAN_ATTACKER));
};
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map