import { Emperor, King, Prince, Warlord } from '../Difficulties';
import {
  FOOD_ROWS_UNTIL,
  LateGame,
  SHIELD_ROWS_UNTIL,
  foodBoxRows,
  lateRows,
  shieldRows,
} from '../level';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import ApolloProgram from '@civ-clone/base-wonder-apolloprogram/ApolloProgram';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import City from '@civ-clone/core-city/City';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import ManhattanProject from '@civ-clone/base-wonder-manhattanproject/ManhattanProject';
import NuclearFission from '@civ-clone/base-science-advance-nuclearfission/NuclearFission';
import Player from '@civ-clone/core-player/Player';
import PlayerRegistry from '@civ-clone/core-player/PlayerRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import Rank from '@civ-clone/core-power/Rules/Rank';
import Rocketry from '@civ-clone/base-science-advance-rocketry/Rocketry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SpaceFlight from '@civ-clone/base-science-advance-spaceflight/SpaceFlight';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Wonder from '@civ-clone/core-wonder/Wonder';
import WonderRegistry from '@civ-clone/core-wonder/WonderRegistry';
import buildCostModifiers from '../Rules/City/build-cost';
import { buildCosts } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';
import lateGame from '../lib/lateGame';

// OpenCiv2 `src/auto/city.cpp` `city_calc_food_box_rows` (~2630) and `city_calc_unit_support` (~2681),
//  richardpenman/civ2@49f26ec.

const nobody = { human: false, computer: false },
  late = (turn: number, changes: Partial<LateGame> = {}): LateGame => ({
    turn,
    humanLeads: true,
    manhattanProject: false,
    apolloProgram: false,
    rocketry: nobody,
    nuclearFission: nobody,
    spaceFlight: nobody,
    ...changes,
  });

describe('late-game rows', (): void => {
  it('take 2 food rows off after turn 200, and 2 shield rows from turn 200', (): void => {
    expect(FOOD_ROWS_UNTIL).equal(200);
    expect(SHIELD_ROWS_UNTIL).equal(199);

    // `200 < game.turn`
    expect(lateRows(3, late(200), FOOD_ROWS_UNTIL)).equal(0);
    expect(lateRows(3, late(201), FOOD_ROWS_UNTIL)).equal(2);
    // `199 < game.turn`
    expect(lateRows(3, late(199), SHIELD_ROWS_UNTIL)).equal(0);
    expect(lateRows(3, late(200), SHIELD_ROWS_UNTIL)).equal(2);
  });

  it('only above Warlord (`DIFF_WARLORD < game.difficulty`), and only while a human leads', (): void => {
    expect(
      [0, 1, 2, 3, 4, 5].map((level) =>
        lateRows(level, late(250), FOOD_ROWS_UNTIL)
      )
    ).eql([0, 0, 2, 2, 2, 2]);
    expect(
      lateRows(5, late(250, { humanLeads: false }), FOOD_ROWS_UNTIL)
    ).equal(0);
  });

  it('take 1 with the Manhattan Project built and Rocketry known by a computer player, if the humans know Rocketry and Nuclear Fission', (): void => {
    const both = { human: true, computer: true };

    expect(
      lateRows(
        4,
        late(250, {
          manhattanProject: true,
          rocketry: both,
          nuclearFission: { human: true, computer: false },
        }),
        FOOD_ROWS_UNTIL
      )
    ).equal(1);
    // No human knows Nuclear Fission: none.
    expect(
      lateRows(
        4,
        late(250, { manhattanProject: true, rocketry: both }),
        FOOD_ROWS_UNTIL
      )
    ).equal(0);
    // No human knows Rocketry: none.
    expect(
      lateRows(
        4,
        late(250, {
          manhattanProject: true,
          rocketry: { human: false, computer: true },
          nuclearFission: both,
        }),
        FOOD_ROWS_UNTIL
      )
    ).equal(0);
    // Only the humans know Rocketry, or the Manhattan Project has never been built: still 2.
    expect(
      lateRows(
        4,
        late(250, {
          manhattanProject: true,
          rocketry: { human: true, computer: false },
        }),
        FOOD_ROWS_UNTIL
      )
    ).equal(2);
    expect(
      lateRows(
        4,
        late(250, { rocketry: both, nuclearFission: both }),
        FOOD_ROWS_UNTIL
      )
    ).equal(2);
  });

  it('take 1 fewer with the Apollo Program built and Space Flight known by a computer player, 2 fewer if no human knows it, and never fewer than 0', (): void => {
    expect(
      lateRows(
        4,
        late(250, {
          apolloProgram: true,
          spaceFlight: { human: true, computer: true },
        }),
        FOOD_ROWS_UNTIL
      )
    ).equal(1);
    expect(
      lateRows(
        4,
        late(250, {
          apolloProgram: true,
          spaceFlight: { human: false, computer: true },
        }),
        FOOD_ROWS_UNTIL
      )
    ).equal(0);
    // From the Manhattan Project's 1: 0, and -1 clamped to 0.
    expect(
      lateRows(
        4,
        late(250, {
          manhattanProject: true,
          rocketry: { human: true, computer: true },
          nuclearFission: { human: true, computer: false },
          apolloProgram: true,
          spaceFlight: { human: false, computer: true },
        }),
        FOOD_ROWS_UNTIL
      )
    ).equal(0);
    // Only the humans know Space Flight: still 2.
    expect(
      lateRows(
        4,
        late(250, {
          apolloProgram: true,
          spaceFlight: { human: true, computer: false },
        }),
        FOOD_ROWS_UNTIL
      )
    ).equal(2);
  });

  it("come off a computer player's rows before the @COSMIC scaling, never off the human's", (): void => {
    expect(
      [0, 1, 2, 3, 4, 5].map((level) => foodBoxRows(level, false, late(201)))
    ).eql([15, 13, 10, 8, 7, 6]);
    expect(
      [0, 1, 2, 3, 4, 5].map((level) => shieldRows(level, false, late(200)))
    ).eql([15, 13, 10, 8, 7, 6]);
    expect(foodBoxRows(5, false, late(200))).equal(8);
    expect(shieldRows(5, false, late(199))).equal(8);
    expect(foodBoxRows(5, true, late(250))).equal(10);
    expect(shieldRows(5, true, late(250))).equal(10);
  });
});

describe('lateGame', (): void => {
  const setUp = () => {
    const ruleRegistry = new RuleRegistry(),
      clientRegistry = new ClientRegistry(),
      gameDifficultyRegistry = new GameDifficultyRegistry(),
      playerRegistry = new PlayerRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      turn = new Turn(),
      // Stand-ins: `everBuilt` asks the standing Wonders, and every Wonder ever built by type.
      wonders: Wonder[] = [],
      lost: Wonder[] = [],
      wonderRegistry = {
        some: (test: (wonder: Wonder) => boolean) => wonders.some(test),
      } as unknown as WonderRegistry,
      cityImprovementRegistry = {
        getByType: (WonderType: typeof Wonder) =>
          lost.filter((wonder) => wonder instanceof WonderType),
      } as unknown as CityImprovementRegistry,
      scores = new Map<Player, number>(),
      [human, computer] = [Client, AIClient].map((ClientType) => {
        const player = new Player(ruleRegistry),
          research = new PlayerResearch(player);

        playerRegistry.register(player);
        playerResearchRegistry.register(research);
        clientRegistry.register(new ClientType(player));
        scores.set(player, 0);

        return { player, research };
      });

    gameDifficultyRegistry.set(Emperor);

    ruleRegistry.register(
      new Rank(new Effect((player: Player): number => scores.get(player)!))
    );

    const read = lateGame({
      cityImprovementRegistry,
      clientRegistry,
      gameDifficultyRegistry,
      playerRegistry,
      playerResearchRegistry,
      ruleRegistry,
      turn,
      wonderRegistry,
    });

    return {
      clientRegistry,
      computer,
      gameDifficultyRegistry,
      human,
      lost,
      read,
      ruleRegistry,
      scores,
      turn,
      wonders,
    };
  };

  it('reads nothing before turn 200 or at Warlord', (): void => {
    const { gameDifficultyRegistry, human, read, scores, turn } = setUp();

    scores.set(human.player, 100);
    turn.set(199);

    expect(read().humanLeads).false;

    turn.set(200);
    gameDifficultyRegistry.set(Warlord);

    expect(read().humanLeads).false;

    gameDifficultyRegistry.set(Prince);

    expect(read()).eql(late(200));
  });

  it("ranks the players by the game's Rank rules once a turn, a tie going to the first registered", (): void => {
    const { computer, human, read, scores, turn } = setUp();

    turn.set(250);

    // A tie: the human was registered first.
    expect(read().humanLeads).true;

    scores.set(computer.player, 10);

    // Ranked once a turn, as Civ2 ranks as the turn begins.
    expect(read().humanLeads).true;

    turn.set(251);

    expect(read().humanLeads).false;

    scores.set(human.player, 11);
    turn.set(252);

    expect(read().humanLeads).true;
  });

  it('reads the Wonders ever built, standing or lost, and who knows the advances', (): void => {
    const { computer, human, lost, read, turn, wonders } = setUp();

    turn.set(250);

    wonders.push(Object.create(ManhattanProject.prototype));
    lost.push(Object.create(ApolloProgram.prototype));
    human.research.addAdvance(Rocketry);
    computer.research.addAdvance(Rocketry);
    computer.research.addAdvance(NuclearFission);
    human.research.addAdvance(SpaceFlight);

    expect(read()).eql({
      turn: 250,
      humanLeads: true,
      manhattanProject: true,
      apolloProgram: true,
      rocketry: { human: true, computer: true },
      nuclearFission: { human: false, computer: true },
      spaceFlight: { human: true, computer: false },
    });
  });

  it("take shield rows off a computer player's build costs from turn 200", (): void => {
    const ruleRegistry = new RuleRegistry(),
      clientRegistry = new ClientRegistry(),
      gameDifficultyRegistry = new GameDifficultyRegistry(),
      playerRegistry = new PlayerRegistry(),
      turn = new Turn(),
      [human, computer] = [Client, AIClient].map((ClientType) => {
        const player = new Player(ruleRegistry);

        playerRegistry.register(player);
        clientRegistry.register(new ClientType(player));

        return player;
      });

    class Settlers {}

    gameDifficultyRegistry.set(King);

    ruleRegistry.register(
      // The human leads.
      new Rank(
        new Effect((player: Player): number => (player === human ? 1 : 0))
      ),
      ...(buildCosts([[Settlers, 30]] as any) as any[]),
      ...buildCostModifiers(gameDifficultyRegistry, clientRegistry, {
        cityImprovementRegistry: {
          getByType: () => [],
        } as unknown as CityImprovementRegistry,
        playerRegistry,
        playerResearchRegistry: new PlayerResearchRegistry(),
        ruleRegistry,
        turn,
        wonderRegistry: { some: () => false } as unknown as WonderRegistry,
      })
    );

    const cost = (): number =>
      new BuildItem(
        Settlers as any,
        { player: () => computer } as unknown as City,
        ruleRegistry
      )
        .cost()
        .value();

    turn.set(199);

    expect(cost()).equal(30);

    turn.set(200);

    // 8 rows at King, from 10.
    expect(cost()).equal(24);
  });
});
