import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  computerBuildCost,
  isComputerCity,
} from '@civ-clone/base-difficulty/lib/buildCost';
import { levelOf, shieldRows } from '../../level';
import BuildCostModifier from '@civ-clone/core-city-build/Rules/BuildCostModifier';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';

// A computer player's city builds against its own shield rows (`shieldRows`), where the human's are 10: costs are
//  listed for 10 rows, so a computer player pays rows / 10 of each.
export const getRules = (
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance
): BuildCostModifier[] => [
  new BuildCostModifier(
    'civ2-difficulty:city/build-cost/computer',
    new Criterion(isComputerCity(clientRegistry)),
    new Effect(
      computerBuildCost(() =>
        shieldRows(levelOf(gameDifficultyRegistry), false)
      )
    )
  ),
];

export default getRules;
