"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deity = exports.Emperor = exports.King = exports.Prince = exports.Warlord = exports.Chieftain = void 0;
// Civilization II's six levels, from `base-difficulty-*`. `level()` is the game's difficulty, 0 (Chieftain) to 5
//  (Deity), which every formula that depends on the level reads (OpenCiv2 `src/include/enums.h:182`).
var Chieftain_1 = require("@civ-clone/base-difficulty-chieftain/Chieftain");
Object.defineProperty(exports, "Chieftain", { enumerable: true, get: function () { return Chieftain_1.Chieftain; } });
var Warlord_1 = require("@civ-clone/base-difficulty-warlord/Warlord");
Object.defineProperty(exports, "Warlord", { enumerable: true, get: function () { return Warlord_1.Warlord; } });
var Prince_1 = require("@civ-clone/base-difficulty-prince/Prince");
Object.defineProperty(exports, "Prince", { enumerable: true, get: function () { return Prince_1.Prince; } });
var King_1 = require("@civ-clone/base-difficulty-king/King");
Object.defineProperty(exports, "King", { enumerable: true, get: function () { return King_1.King; } });
var Emperor_1 = require("@civ-clone/base-difficulty-emperor/Emperor");
Object.defineProperty(exports, "Emperor", { enumerable: true, get: function () { return Emperor_1.Emperor; } });
var Deity_1 = require("@civ-clone/base-difficulty-deity/Deity");
Object.defineProperty(exports, "Deity", { enumerable: true, get: function () { return Deity_1.Deity; } });
//# sourceMappingURL=Difficulties.js.map