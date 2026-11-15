import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { LateGame } from '../level';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
export interface LateGameDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  clientRegistry?: ClientRegistry;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerRegistry?: PlayerRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  ruleRegistry?: RuleRegistry;
  turn?: Turn;
  wonderRegistry?: WonderRegistry;
}
/**
 * A reader of what the computer players' late-game rows depend on (`LateGame`, for `foodBoxRows` and `shieldRows`), as
 * a game stands when it's called:
 *
 * - the turn, `turn.value()`, which is Civ2's `game.turn`;
 * - whether a human leads the power ranking: core-power's `rankings` of the players who aren't the barbarians (Civ2
 *   ranks civilizations 1 to 7, never the barbarians' 0), by the game's `Rank` rules (civ2-power's: advances × 3 +
 *   citizens × 8 + gold / 32, `civ.cpp` `civ_update_power_ranks`), a tie going to the player registered first. Civ2
 *   ranks once a turn, as the turn begins; this ranks once a turn too, the first time any reader of the game asks
 *   that turn, and every reader of the game is given the same answer that turn;
 * - whether the Manhattan Project and the Apollo Program have ever been built, standing or lost (base-wonder's
 *   `everBuilt`: Civ2 asks `wonder_city != -1`, and a lost Wonder is -2);
 * - whether a human, and whether a computer player (the barbarians included), knows Rocketry, Nuclear Fission and
 *   Space Flight (`game.advance_known_by`).
 *
 * One difference: Civ2 reads "a computer player knows it" as `~human_players & (char)advance_known_by[...]`, whose sign
 * extension makes it true whenever civilization 7 knows the advance, human or not. Players here have no slot numbers,
 * so that isn't followed.
 *
 * Before turn 200 (`SHIELD_ROWS_UNTIL` + 1), at Chieftain and Warlord, and while no human leads, nothing takes rows off,
 * so it reads no Wonders or advances (nor, for the first two, the ranking) and answers that no human leads.
 */
export declare const lateGame: ({
  cityImprovementRegistry,
  clientRegistry,
  gameDifficultyRegistry,
  playerRegistry,
  playerResearchRegistry,
  ruleRegistry,
  turn,
  wonderRegistry,
}?: LateGameDependencies) => () => LateGame;
export default lateGame;
