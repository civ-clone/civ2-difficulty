# civ2-difficulty

Civilization II's six difficulty levels, Chieftain (easiest) to Deity (toughest), and the numbers that depend on them,
from OpenCiv2's reconstruction of the original.

- `Difficulties`: `Chieftain`, `Warlord`, `Prince`, `King`, `Emperor` and `Deity`, the `base-difficulty-*` levels,
  registered in the game's `availableDifficulties`.
- `levelOf(game.difficulty)`: the level, 0 to 5. A game with no level set plays at King.
- `isHuman(player, game.clients)`: whether a person plays `player` (from `base-difficulty`).
- `foodBoxRows(level, human, late?)` and `shieldRows(level, human, late?)`: the rows of a city's food and shield boxes.
  The human has @COSMIC's 10; the computer players have 15, 13, 12, 10, 9 and 8 (OpenCiv2 `city_calc_food_box_rows`,
  `city_calc_unit_support`, richardpenman/civ2@49f26ec), less `lateRows` given `late`.
- `lateRows(level, late, until)`: the rows Civ2 takes off the computer players late in the game, 0 to 2: after turn
  `until` (`FOOD_ROWS_UNTIL`, 200, for food, `SHIELD_ROWS_UNTIL`, 199, for shields), above Warlord, while a human
  leads the power ranking; fewer once a computer player knows Rocketry with the Manhattan Project built (unless the
  humans lack Rocketry or Nuclear Fission, when none), or Space Flight with the Apollo Program.
- `lib/lateGame`: `lateGame({ turn, playerRegistry, ruleRegistry, ... })`, a reader of what `late` holds, from a game:
  the turn, whether a human leads core-power's `rankings` (the game's `Rank` rules, civ2-power's in a Civ2 game, ranked
  once a turn), the Wonders ever built, and who knows the advances.

The rule here makes the computer players pay `shieldRows / 10` of every build cost, late-game rows included. The food box rows are for the city
package's growth rule.

The combat handicaps (`unit_resolve_attack`), for any attacker that isn't a barbarian, are the rule set
`civ2-difficulty:combat-handicaps`, so a game can switch them off: below Prince, an attack on a human's unit is
halved; on Chieftain, a human's attack is doubled.

One difference from the original: Civ2's "a computer player knows it" test is also true whenever civilization 7 knows
the advance, human or not (a sign extension); players here have no slot numbers, so that isn't followed.
