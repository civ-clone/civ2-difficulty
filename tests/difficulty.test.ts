import {
  Chieftain,
  Deity,
  Emperor,
  King,
  Prince,
  Warlord,
} from '../Difficulties';
import { foodBoxRows, levelOf, shieldRows } from '../level';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import AvailableDifficultyRegistry from '@civ-clone/core-difficulty/AvailableDifficultyRegistry';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import City from '@civ-clone/core-city/City';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import { Game } from '@civ-clone/core-game';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import buildCostModifiers from '../Rules/City/build-cost';
import { buildCosts } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';
import { register } from '../registerDifficulties';

const levels = [Chieftain, Warlord, Prince, King, Emperor, Deity];

describe('levels', (): void => {
  it('are numbered 0 (Chieftain) to 5 (Deity)', (): void => {
    expect(levels.map((Level) => Level.level())).eql([0, 1, 2, 3, 4, 5]);
  });

  it('registers all six, Chieftain to Deity', (): void => {
    const availableDifficulties = new AvailableDifficultyRegistry();

    register({ availableDifficulties } as unknown as Game);

    expect(availableDifficulties.entries()).eql(levels);
  });

  it('play at King when none is set', (): void => {
    const gameDifficultyRegistry = new GameDifficultyRegistry();

    expect(levelOf(gameDifficultyRegistry)).equal(3);

    gameDifficultyRegistry.set(Deity);

    expect(levelOf(gameDifficultyRegistry)).equal(5);
  });
});

describe('box rows', (): void => {
  it('give the computer 15, 13, 12, 10, 9 and 8 food rows, and the human 10', (): void => {
    expect([0, 1, 2, 3, 4, 5].map((level) => foodBoxRows(level, false))).eql([
      15, 13, 12, 10, 9, 8,
    ]);
    expect([0, 1, 2, 3, 4, 5].map((level) => foodBoxRows(level, true))).eql([
      10, 10, 10, 10, 10, 10,
    ]);
  });

  it('give the computer 15, 13, 12, 10, 9 and 8 shield rows, and the human 10', (): void => {
    expect([0, 1, 2, 3, 4, 5].map((level) => shieldRows(level, false))).eql([
      15, 13, 12, 10, 9, 8,
    ]);
    expect([0, 1, 2, 3, 4, 5].map((level) => shieldRows(level, true))).eql([
      10, 10, 10, 10, 10, 10,
    ]);
  });
});

class Warrior {}
class Settlers {}

describe('build costs', (): void => {
  const costFor = (
    Level: typeof Chieftain | null,
    client: 'human' | 'computer' | 'none',
    Item: typeof Warrior
  ): number => {
    const ruleRegistry = new RuleRegistry(),
      clientRegistry = new ClientRegistry(),
      gameDifficultyRegistry = new GameDifficultyRegistry(),
      player = new Player(ruleRegistry),
      city = { player: () => player } as unknown as City;

    if (Level !== null) {
      gameDifficultyRegistry.set(Level);
    }

    if (client !== 'none') {
      clientRegistry.register(
        client === 'human' ? new Client(player) : new AIClient(player)
      );
    }

    ruleRegistry.register(
      ...(buildCosts([
        [Warrior, 10],
        [Settlers, 30],
      ] as any) as any[]),
      ...buildCostModifiers(gameDifficultyRegistry, clientRegistry)
    );

    return new BuildItem(Item as any, city, ruleRegistry).cost().value();
  };

  it('are 150% for a computer player on Chieftain, down to 80% on Deity', (): void => {
    expect(costFor(Chieftain, 'computer', Warrior)).equal(15);
    expect(costFor(Chieftain, 'computer', Settlers)).equal(45);
    expect(costFor(Warlord, 'computer', Settlers)).equal(39);
    expect(costFor(Prince, 'computer', Settlers)).equal(36);
    expect(costFor(King, 'computer', Settlers)).equal(30);
    expect(costFor(Emperor, 'computer', Settlers)).equal(27);
    expect(costFor(Deity, 'computer', Settlers)).equal(24);
  });

  it('are as listed for the human at every level', (): void => {
    expect(costFor(Chieftain, 'human', Warrior)).equal(10);
    expect(costFor(Deity, 'human', Settlers)).equal(30);
  });

  it('are as listed for a computer player with no level set (King)', (): void => {
    expect(costFor(null, 'computer', Settlers)).equal(30);
  });

  it("charge a player with no client yet as a computer player, as Civ1's do", (): void => {
    expect(costFor(Deity, 'none', Settlers)).equal(24);
  });
});
