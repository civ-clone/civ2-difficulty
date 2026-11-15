import { Game, defaultGame } from '@civ-clone/core-game';
import unitStrength, {
  HUMAN_ATTACKER,
  HUMAN_DEFENDER,
} from './Rules/Unit/strength';
import { COMBAT_HANDICAPS } from './RuleSets';
import RuleSet from '@civ-clone/core-rule/RuleSet';
import buildCost from './Rules/City/build-cost';

export const register = (game: Game): void => {
  game.rules.register(
    ...buildCost(game.difficulty, game.clients, {
      cityImprovementRegistry: game.cityImprovements,
      playerRegistry: game.players,
      playerResearchRegistry: game.playerResearch,
      ruleRegistry: game.rules,
      turn: game.turn,
      wonderRegistry: game.wonders,
    }),
    ...unitStrength(game.difficulty, game.clients)
  );

  // The level's combat handicaps, as a set a game can switch off.
  game.ruleSets.register(
    new RuleSet(COMBAT_HANDICAPS, HUMAN_DEFENDER, HUMAN_ATTACKER)
  );
};

// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
register(defaultGame);

export default register;
