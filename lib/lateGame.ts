import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { Known, LateGame, SHIELD_ROWS_UNTIL, levelOf } from '../level';
import {
  PlayerRegistry,
  instance as playerRegistryInstance,
} from '@civ-clone/core-player/PlayerRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import Advance from '@civ-clone/core-science/Advance';
import ApolloProgram from '@civ-clone/base-wonder-apolloprogram/ApolloProgram';
import ManhattanProject from '@civ-clone/base-wonder-manhattanproject/ManhattanProject';
import NuclearFission from '@civ-clone/base-science-advance-nuclearfission/NuclearFission';
import Player from '@civ-clone/core-player/Player';
import Rocketry from '@civ-clone/base-science-advance-rocketry/Rocketry';
import SpaceFlight from '@civ-clone/base-science-advance-spaceflight/SpaceFlight';
import { Warlord } from '../Difficulties';
import { everBuilt } from '@civ-clone/base-wonder/lib/wonderHistory';
import { isBarbarian } from '@civ-clone/base-civilization-barbarian/isBarbarian';
import isHuman from '../isHuman';
import { rankings } from '@civ-clone/core-power/lib/rank';

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

const nobody: Known = { human: false, computer: false };

/**
 * A reader of what the computer players' late-game rows depend on (`LateGame`, for `foodBoxRows` and `shieldRows`), as
 * a game stands when it's called:
 *
 * - the turn, `turn.value()`, which is Civ2's `game.turn`;
 * - whether a human leads the power ranking: core-power's `rankings` of the players who aren't the barbarians (Civ2
 *   ranks civilizations 1 to 7, never the barbarians' 0), by the game's `Rank` rules (civ2-power's: advances × 3 +
 *   citizens × 8 + gold / 32, `civ.cpp` `civ_update_power_ranks`), a tie going to the player registered first. Civ2
 *   ranks once a turn, as the turn begins; this ranks once a turn too, the first time it's asked that turn;
 * - whether the Manhattan Project and the Apollo Program have ever been built, standing or lost (base-wonder's
 *   `everBuilt`: Civ2 asks `wonder_city != -1`, and a lost Wonder is -2);
 * - whether a human, and whether a computer player (the barbarians included), knows Rocketry, Nuclear Fission and
 *   Space Flight (`game.advance_known_by`).
 *
 * One difference: Civ2 reads "a computer player knows it" as `~human_players & (char)advance_known_by[...]`, whose sign
 * extension makes it true whenever civilization 7 knows the advance, human or not. Players here have no slot numbers,
 * so that isn't followed.
 *
 * Before turn 200 (`SHIELD_ROWS_UNTIL` + 1), and at Chieftain and Warlord, nothing takes rows off, so it reads nothing
 * and answers that no human leads.
 */
export const lateGame = ({
  cityImprovementRegistry = cityImprovementRegistryInstance,
  clientRegistry = clientRegistryInstance,
  gameDifficultyRegistry = gameDifficultyRegistryInstance,
  playerRegistry = playerRegistryInstance,
  playerResearchRegistry = playerResearchRegistryInstance,
  ruleRegistry = ruleRegistryInstance,
  turn = turnInstance,
  wonderRegistry = wonderRegistryInstance,
}: LateGameDependencies = {}): (() => LateGame) => {
  let rankedTurn: number | null = null,
    humanLeads = false;

  const leaderIsHuman = (currentTurn: number): boolean => {
      if (rankedTurn !== currentTurn) {
        const [leader] = rankings(
          playerRegistry.filter(
            (player: Player): boolean => !isBarbarian(player)
          ),
          ruleRegistry
        );

        humanLeads = leader !== undefined && isHuman(leader, clientRegistry);
        rankedTurn = currentTurn;
      }

      return humanLeads;
    },
    knows = (player: Player, AdvanceType: typeof Advance): boolean => {
      try {
        return playerResearchRegistry
          .getByPlayer(player)
          .completed(AdvanceType);
      } catch (e) {
        // A player with no research (yet) knows nothing.
        return false;
      }
    },
    known = (AdvanceType: typeof Advance): Known =>
      playerRegistry.entries().reduce(
        (who: Known, player: Player): Known => {
          if (!knows(player, AdvanceType)) {
            return who;
          }

          return isHuman(player, clientRegistry)
            ? { ...who, human: true }
            : { ...who, computer: true };
        },
        { ...nobody }
      );

  return (): LateGame => {
    const currentTurn = turn.value();

    if (
      currentTurn <= SHIELD_ROWS_UNTIL ||
      levelOf(gameDifficultyRegistry) <= Warlord.level()
    ) {
      return {
        turn: currentTurn,
        humanLeads: false,
        manhattanProject: false,
        apolloProgram: false,
        rocketry: nobody,
        nuclearFission: nobody,
        spaceFlight: nobody,
      };
    }

    return {
      turn: currentTurn,
      humanLeads: leaderIsHuman(currentTurn),
      manhattanProject: everBuilt(
        ManhattanProject,
        wonderRegistry,
        cityImprovementRegistry
      ),
      apolloProgram: everBuilt(
        ApolloProgram,
        wonderRegistry,
        cityImprovementRegistry
      ),
      rocketry: known(Rocketry),
      nuclearFission: known(NuclearFission),
      spaceFlight: known(SpaceFlight),
    };
  };
};

export default lateGame;
