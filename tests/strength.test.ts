import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import { Chieftain, Deity, King, Warlord } from '../Difficulties';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import { COMBAT_HANDICAPS } from '../RuleSets';
import { Game } from '@civ-clone/core-game';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';
import register from '../registerRules';
import strength from '../Rules/Unit/strength';

// The attack `attacker` (a human's or a computer player's, or the barbarians') fights at against `defender` at `Level`,
//  from an attack of 8.
const attackAt = (
  Level: typeof King,
  attacker: 'human' | 'computer' | 'barbarian',
  defender: 'human' | 'computer'
): number => {
  const ruleRegistry = new RuleRegistry(),
    clientRegistry = new ClientRegistry(),
    gameDifficultyRegistry = new GameDifficultyRegistry(),
    player = (kind: string): Player => {
      const p = new Player(ruleRegistry);

      Object.assign(p, {
        civilization: () =>
          kind === 'barbarian'
            ? Object.create(Barbarian.prototype)
            : ({} as never),
      });

      clientRegistry.register(
        kind === 'human' ? new Client(p) : new AIClient(p)
      );

      return p;
    },
    unit = (p: Player): Unit =>
      Object.assign(Object.create(Unit.prototype), { player: () => p }),
    a = unit(player(attacker)),
    d = unit(player(defender)),
    attack = new Attack(8),
    defence = new Defence(1);

  gameDifficultyRegistry.set(Level);
  ruleRegistry.register(...strength(gameDifficultyRegistry, clientRegistry));
  ruleRegistry.process(Strength, a, d, attack, defence);

  return attack.value();
};

describe('combat handicaps (`unit_resolve_attack`)', (): void => {
  it("halves an attack on a human's unit below Prince, but not a barbarian's", (): void => {
    expect(attackAt(Warlord, 'computer', 'human')).to.equal(4);
    expect(attackAt(Chieftain, 'computer', 'human')).to.equal(4);
    expect(attackAt(King, 'computer', 'human')).to.equal(8);
    expect(attackAt(Warlord, 'barbarian', 'human')).to.equal(8);
    expect(attackAt(Warlord, 'computer', 'computer')).to.equal(8);
  });

  it("doubles a human's attack on Chieftain, a barbarian defender's too", (): void => {
    expect(attackAt(Chieftain, 'human', 'computer')).to.equal(16);
    expect(attackAt(Warlord, 'human', 'computer')).to.equal(8);
    expect(attackAt(Deity, 'human', 'computer')).to.equal(8);
  });

  it('registers both as a rule set a game can switch off', (): void => {
    const game = new Game();

    register(game);

    expect(
      game.ruleSets
        .get(COMBAT_HANDICAPS)
        ?.members()
        .map((member: unknown) => String(member))
    ).to.deep.equal([
      'civ2-difficulty:unit/strength/human-defender',
      'civ2-difficulty:unit/strength/human-attacker',
    ]);
  });
});
