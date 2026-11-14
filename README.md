# civ2-difficulty

Civilization II's six difficulty levels, Chieftain (easiest) to Deity (toughest), and the numbers that depend on them,
from OpenCiv2's reconstruction of the original.

- `Difficulties`: `Chieftain`, `Warlord`, `Prince`, `King`, `Emperor` and `Deity`, the `base-difficulty-*` levels,
  registered in the game's `availableDifficulties`.
- `levelOf(game.difficulty)`: the level, 0 to 5. A game with no level set plays at King.
- `isHuman(player, game.clients)`: whether a person plays `player` (from `base-difficulty`).
- `foodBoxRows(level, human)` and `shieldRows(level, human)`: the rows of a city's food and shield boxes. The human
  has @COSMIC's 10; the computer players have 15, 13, 12, 10, 9 and 8 (OpenCiv2 `city_calc_food_box_rows`, `city_calc_unit_support`, richardpenman/civ2@49f26ec).

The rule here makes the computer players pay `shieldRows / 10` of every build cost. The food box rows are for the city
package's growth rule.

Not yet here: after turn 200, above Warlord, Civ2 takes up to 2 more rows off the computer players while a human leads
the power ranking. That needs Civ2's advances and wonders (the Manhattan Project, the Apollo Program).
