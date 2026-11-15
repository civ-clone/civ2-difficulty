import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import Strength from '@civ-clone/core-unit/Rules/Strength';
export declare const HUMAN_DEFENDER =
  'civ2-difficulty:unit/strength/human-defender';
export declare const HUMAN_ATTACKER =
  'civ2-difficulty:unit/strength/human-attacker';
/**
 * The level's combat handicaps (OpenCiv2 `unit_resolve_attack`, richardpenman/civ2@49f26ec), for any attacker that
 *  isn't a barbarian:
 * - below Prince, an attack on a human player's unit is halved (`human-defender`);
 * - on Chieftain, a human player's attack is doubled (`human-attacker`).
 *
 * The code asks only whether the defender (or the attacker) is a human's; it doesn't ask whether the other side is a
 *  computer player's. Both are in the `COMBAT_HANDICAPS` rule set, so a game can switch them off.
 */
export declare const getRules: (
  gameDifficultyRegistry?: GameDifficultyRegistry,
  clientRegistry?: ClientRegistry
) => Strength[];
export default getRules;
