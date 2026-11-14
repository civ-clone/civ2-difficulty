import { expect } from 'chai';
import { join } from 'path';
import { readDifficulty } from '@civ-clone/civ2-asset-extractor/rules';
import { readFileSync } from 'fs';
import * as Difficulties from '../Difficulties';

// Compares the levels with the player's own RULES.TXT. Skipped unless `CIV2_PATH` names the game's folder, so CI,
//  which has no copy of the game, never runs it. Only the number of rows is compared.
const path = process.env.CIV2_PATH;

(path ? describe : describe.skip)('RULES.TXT', (): void => {
  it('@DIFFICULTY: one row per level', (): void => {
    const rules = readFileSync(join(path!, 'RULES.TXT'), 'latin1');

    expect(readDifficulty(rules)).length(Object.keys(Difficulties).length);
  });
});
