import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { LateGameDependencies } from '../../lib/lateGame';
import BuildCostModifier from '@civ-clone/core-city-build/Rules/BuildCostModifier';
export declare const getRules: (
  gameDifficultyRegistry?: GameDifficultyRegistry,
  clientRegistry?: ClientRegistry,
  lateGameDependencies?: LateGameDependencies
) => BuildCostModifier[];
export default getRules;
