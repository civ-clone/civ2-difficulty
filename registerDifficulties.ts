import {
  Chieftain,
  Deity,
  Emperor,
  King,
  Prince,
  Warlord,
} from './Difficulties';
import { Game, defaultGame } from '@civ-clone/core-game';

export const register = (game: Game): void =>
  game.availableDifficulties.register(
    Chieftain,
    Warlord,
    Prince,
    King,
    Emperor,
    Deity
  );

// The plugin loader imports each package for this side effect, as it does for the rules.
register(defaultGame);

export default register;
