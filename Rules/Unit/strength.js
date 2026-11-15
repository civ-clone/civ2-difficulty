"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.HUMAN_ATTACKER = exports.HUMAN_DEFENDER = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const Difficulties_1 = require("../../Difficulties");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Strength_1 = require("@civ-clone/core-unit/Rules/Strength");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("../../isHuman");
const level_1 = require("../../level");
exports.HUMAN_DEFENDER = 'civ2-difficulty:unit/strength/human-defender';
exports.HUMAN_ATTACKER = 'civ2-difficulty:unit/strength/human-attacker';
/**
 * The level's combat handicaps (OpenCiv2 `unit_resolve_attack`, richardpenman/civ2@49f26ec), for any attacker that
 *  isn't a barbarian:
 * - below Prince, an attack on a human player's unit is halved (`human-defender`);
 * - on Chieftain, a human player's attack is doubled (`human-attacker`).
 *
 * The code asks only whether the defender (or the attacker) is a human's; it doesn't ask whether the other side is a
 *  computer player's. Both are in the `COMBAT_HANDICAPS` rule set, so a game can switch them off.
 */
const getRules = (gameDifficultyRegistry = GameDifficultyRegistry_1.instance, clientRegistry = ClientRegistry_1.instance) => {
    const notBarbarian = new Criterion_1.default((attacker) => !(0, isBarbarian_1.isBarbarian)(attacker.player()));
    return [
        new Strength_1.default(exports.HUMAN_DEFENDER, notBarbarian, new Criterion_1.default(() => (0, level_1.levelOf)(gameDifficultyRegistry) < Difficulties_1.Prince.level()), new Criterion_1.default((attacker, defender) => (0, isHuman_1.isHuman)(defender.player(), clientRegistry)), new Effect_1.default((attacker, defender, attack, defence) => attack.add(-attack.value() / 2, 'Difficulty'))),
        new Strength_1.default(exports.HUMAN_ATTACKER, notBarbarian, new Criterion_1.default(() => (0, level_1.levelOf)(gameDifficultyRegistry) === Difficulties_1.Chieftain.level()), new Criterion_1.default((attacker) => (0, isHuman_1.isHuman)(attacker.player(), clientRegistry)), new Effect_1.default((attacker, defender, attack, defence) => attack.add(attack.value(), 'Difficulty'))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=strength.js.map