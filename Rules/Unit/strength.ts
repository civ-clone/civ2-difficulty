import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { Chieftain, Prince } from '../../Difficulties';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Unit from '@civ-clone/core-unit/Unit';
import { isBarbarian } from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { isHuman } from '../../isHuman';
import { levelOf } from '../../level';

export const HUMAN_DEFENDER = 'civ2-difficulty:unit/strength/human-defender';
export const HUMAN_ATTACKER = 'civ2-difficulty:unit/strength/human-attacker';

/**
 * The level's combat handicaps (OpenCiv2 `unit_resolve_attack`, richardpenman/civ2@49f26ec), for any attacker that
 *  isn't a barbarian:
 * - below Prince, an attack on a human player's unit is halved (`human-defender`);
 * - on Chieftain, a human player's attack is doubled (`human-attacker`).
 *
 * The code asks only whether the defender (or the attacker) is a human's; it doesn't ask whether the other side is a
 *  computer player's. Both are in the `COMBAT_HANDICAPS` rule set, so a game can switch them off.
 */
export const getRules = (
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance
): Strength[] => {
  const notBarbarian = new Criterion(
    (attacker: Unit): boolean => !isBarbarian(attacker.player())
  );

  return [
    new Strength(
      HUMAN_DEFENDER,
      notBarbarian,
      new Criterion(
        (): boolean => levelOf(gameDifficultyRegistry) < Prince.level()
      ),
      new Criterion((attacker: Unit, defender: Unit): boolean =>
        isHuman(defender.player(), clientRegistry)
      ),
      new Effect(
        (
          attacker: Unit,
          defender: Unit,
          attack: Attack,
          defence: Defence
        ): void => attack.add(-attack.value() / 2, 'Difficulty')
      )
    ),
    new Strength(
      HUMAN_ATTACKER,
      notBarbarian,
      new Criterion(
        (): boolean => levelOf(gameDifficultyRegistry) === Chieftain.level()
      ),
      new Criterion((attacker: Unit): boolean =>
        isHuman(attacker.player(), clientRegistry)
      ),
      new Effect(
        (
          attacker: Unit,
          defender: Unit,
          attack: Attack,
          defence: Defence
        ): void => attack.add(attack.value(), 'Difficulty')
      )
    ),
  ];
};

export default getRules;
