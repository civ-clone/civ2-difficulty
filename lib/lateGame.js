"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lateGame = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const level_1 = require("../level");
const PlayerRegistry_1 = require("@civ-clone/core-player/PlayerRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const ApolloProgram_1 = require("@civ-clone/base-wonder-apolloprogram/ApolloProgram");
const ManhattanProject_1 = require("@civ-clone/base-wonder-manhattanproject/ManhattanProject");
const NuclearFission_1 = require("@civ-clone/base-science-advance-nuclearfission/NuclearFission");
const Rocketry_1 = require("@civ-clone/base-science-advance-rocketry/Rocketry");
const SpaceFlight_1 = require("@civ-clone/base-science-advance-spaceflight/SpaceFlight");
const Difficulties_1 = require("../Difficulties");
const wonderHistory_1 = require("@civ-clone/base-wonder/lib/wonderHistory");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("../isHuman");
const rank_1 = require("@civ-clone/core-power/lib/rank");
const nobody = { human: false, computer: false };
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
 * Before turn 200 (`SHIELD_ROWS_UNTIL` + 1), at Chieftain and Warlord, and while no human leads, nothing takes rows off,
 * so it reads no Wonders or advances (nor, for the first two, the ranking) and answers that no human leads.
 */
const lateGame = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance, playerRegistry = PlayerRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => {
    let rankedTurn = null, humanLeads = false;
    const leaderIsHuman = (currentTurn) => {
        if (rankedTurn !== currentTurn) {
            const [leader] = (0, rank_1.rankings)(playerRegistry.filter((player) => !(0, isBarbarian_1.isBarbarian)(player)), ruleRegistry);
            humanLeads = leader !== undefined && (0, isHuman_1.default)(leader, clientRegistry);
            rankedTurn = currentTurn;
        }
        return humanLeads;
    }, knows = (player, AdvanceType) => {
        try {
            return playerResearchRegistry
                .getByPlayer(player)
                .completed(AdvanceType);
        }
        catch (e) {
            // A player with no research (yet) knows nothing.
            return false;
        }
    }, known = (AdvanceType) => playerRegistry.entries().reduce((who, player) => {
        if (!knows(player, AdvanceType)) {
            return who;
        }
        return (0, isHuman_1.default)(player, clientRegistry)
            ? { ...who, human: true }
            : { ...who, computer: true };
    }, { ...nobody });
    return () => {
        const currentTurn = turn.value();
        // The code tests the turn, the level and the leader first (one `&&`), so the rest is read only when all three hold.
        if (currentTurn <= level_1.SHIELD_ROWS_UNTIL ||
            (0, level_1.levelOf)(gameDifficultyRegistry) <= Difficulties_1.Warlord.level() ||
            !leaderIsHuman(currentTurn)) {
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
            humanLeads: true,
            manhattanProject: (0, wonderHistory_1.everBuilt)(ManhattanProject_1.default, wonderRegistry, cityImprovementRegistry),
            apolloProgram: (0, wonderHistory_1.everBuilt)(ApolloProgram_1.default, wonderRegistry, cityImprovementRegistry),
            rocketry: known(Rocketry_1.default),
            nuclearFission: known(NuclearFission_1.default),
            spaceFlight: known(SpaceFlight_1.default),
        };
    };
};
exports.lateGame = lateGame;
exports.default = exports.lateGame;
//# sourceMappingURL=lateGame.js.map