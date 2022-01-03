import { find, max, min, remove, result } from 'lodash';
import Player from '../classes/player';
import { NigiriEnum, RollsEnum, AppetizersEnum, SpecialsEnum, DessertsEnum }  from '../types/cardNameEnum';
import OnigiriNameEnum from '../types/onigiriNameEnum';
import { ICountMap, IUramakiStanding } from '../types/IPoints';
import IPointsResult, { IPlayerResult } from '../types/IPointsResult';
import IMenu from '../types/IMenu';
import {
  makiPointsMap,
  uramakiPointsMap,
  dumplingPointsMap,
  fruitPointsMap,
} from '../util/pointRules';

const createEmptyResult = (menu: IMenu) => {
  const emptyPlayerResult: IPlayerResult = {};
  emptyPlayerResult['Nigiri'] = 0;
  emptyPlayerResult[menu.roll] = 0;
  menu.appetizers.forEach(appetizer => emptyPlayerResult[appetizer] = 0);
  menu.specials.forEach(special => emptyPlayerResult[special] = 0);
  emptyPlayerResult[menu.dessert] = 0;
  return emptyPlayerResult;
}

const createEmptyResultMap = (players: Player[], menu: IMenu) => {
  const resultMap: IPointsResult = {};
  const emptyPlayerResult = createEmptyResult(menu);

  // create each player's result map
  players.forEach(p => { resultMap[p.name] = { ...emptyPlayerResult } });
  return resultMap;
}

const addPlayerPoints = (playerName: string, players: Player[], points: number) => {
  find(players, p => p.name === playerName)!.points += points;
};

const calculateTurnPoints = (players: Player[], resultsMap: IPointsResult, menu: IMenu, uramakiCountMap: ICountMap, uramakiStanding: IUramakiStanding) => {
  players.forEach(currPlyr => {
    // Get list of unused wasabi cards
    let wasabi = currPlyr.playedCards.filter(
      card => card.name === SpecialsEnum.WASABI && !card.data
    );
    while (currPlyr.turnCards.length !== 0) {
      const card = currPlyr.turnCards.pop()!;
      switch (card.name) {
        case NigiriEnum.EGG:
          // Update wasabi with score to triple the nigiri's value
          if (wasabi.length > 0) {
            wasabi[0].data = 2;
            // Shift the used wasabi out of the list of unused wasabis
            wasabi.shift();
          }
          break;
        case NigiriEnum.SALMON:
          if (wasabi.length > 0) {
            wasabi[0].data = 4;
            wasabi.shift();
          }
          break;
        case NigiriEnum.SQUID:
          if (wasabi.length > 0) {
            wasabi[0].data = 6;
            wasabi.shift();
          }
          break;
        case AppetizersEnum.MISO_SOUP:
          // Find all other players that played a miso (including yourself)
          const repeats = players.filter(p =>
            // the current card has been popped out of your own turnCards, so we can check in this way
            p.turnCards.find(c => c.name === AppetizersEnum.MISO_SOUP)
          );

          const value = repeats.length !== 0 ? 0 : 3;
          repeats.forEach(repeat => {
            // Update all player's miso cards (besides current card) accordingly and put them into playedCards
            const miso = remove(
              repeat.turnCards,
              el => el.name === AppetizersEnum.MISO_SOUP
            );
            miso.forEach(c => c.data = value);
            repeat.playedCards = repeat.playedCards.concat(miso);
          });
          // Update current player's card
          card.data = value;
          break;
        case RollsEnum.URAMAKI:
          // Count the current player's uramaki points
          uramakiCountMap[currPlyr.name] += card.data;
          break;
        default:
          break;
      }
      currPlyr.playedCards.push(card);
    }
  });

  if (menu.roll === RollsEnum.URAMAKI && uramakiStanding.value <= 3) {
    calculateUramakiPoints(players, resultsMap, uramakiCountMap, uramakiStanding);
  }
}; // calculateTurnPoints

const calculateUramakiPoints = (players: Player[], resultsMap: IPointsResult, uramakiCountMap: ICountMap, uramakiStanding: IUramakiStanding) => {
  const isLastTurnInRound = players[0].hand.length === 0; // no cards left
  const potentialWinners = Object.entries(uramakiCountMap)
    .filter(el => (isLastTurnInRound ? true : el[1] >= 10))
    // don't need to limit to only above 10 uramaki's if the round is over
    .sort((el1, el2) => el2[1] - el1[1]);

  let prevValue = 0;
  let equivStanding = uramakiStanding.value;

  // uramakiStanding is how many prizes are given out
  // aka how many places on the standing list are already taken
  // equivStanding is the prize the person receives
  // If it is a tie for 1st places, both have equivStanding of 1
  // In that case, those 2 would take up the 1st and 2nd uramakiStanding places

  potentialWinners.forEach(el => {
    if (el[1] === prevValue) {
      equivStanding--;
    } else if (equivStanding >= 4) {
      return;
    } else {
      equivStanding = uramakiStanding.value;
    }
    if (equivStanding <= 3) {
      addPlayerPoints(el[0], players, uramakiPointsMap[equivStanding]);
      resultsMap[el[0]][RollsEnum.URAMAKI] = uramakiPointsMap[equivStanding] + (resultsMap[el[0]][RollsEnum.URAMAKI] || 0);
      uramakiCountMap[el[0]] = 0;
      uramakiStanding.value++;
    }
    prevValue = el[1];
    equivStanding++;
  });
}; // calculateUramakiPoints

// Base Function
const calculateRoundPoints = (players: Player[], resultMap: IPointsResult, menu: IMenu) => {
  calculateNigiriPoints(players, resultMap);
  calculateAppetizerPoints(players, resultMap, menu);
  calculateRollPoints(players, resultMap, menu);
  calculateSpecialPoints(players, resultMap, menu);
}; // calculateRoundPoints

// Hierarchy Functions
const calculateNigiriPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const points = player.playedCards.filter(card => card.name == NigiriEnum.EGG).length
                  + player.playedCards.filter(card => card.name == NigiriEnum.SALMON).length * 2
                  + player.playedCards.filter(card => card.name == NigiriEnum.SQUID).length * 3;
    player.points += points;

    resultMap[player.name]['Nigiri'] = points;
  });
}; // calculateNigiriPoints

const calculateAppetizerPoints = (players: Player[], resultMap: IPointsResult, menu: IMenu) => {
  if (menu.appetizers.includes(AppetizersEnum.DUMPLING)) {
    calculateDumplingPoints(players, resultMap);
  }
  if (menu.appetizers.includes(AppetizersEnum.EDAMAME)) {
    calculateEdamamePoints(players, resultMap);
  }
  if (menu.appetizers.includes(AppetizersEnum.EEL)) {
    calculateEelPoints(players, resultMap);
  }
  if (menu.appetizers.includes(AppetizersEnum.ONIGIRI)) {
    calculateOnigiriPoints(players, resultMap);
  }
  if (menu.appetizers.includes(AppetizersEnum.MISO_SOUP)) {
    calculateMisoSoupPoints(players, resultMap);
  }
  if (menu.appetizers.includes(AppetizersEnum.SASHIMI)) {
    calculateSashimiPoints(players, resultMap);
  }
  if (menu.appetizers.includes(AppetizersEnum.TEMPURA)) {
    calculateTempuraPoints(players, resultMap);
  }
  if (menu.appetizers.includes(AppetizersEnum.TOFU)) {
    calculateTofuPoints(players, resultMap);
  }
}; // calculateAppetizerPoints

const calculateRollPoints = (players: Player[], resultMap: IPointsResult, menu: IMenu) => {
  switch (menu.roll) {
    case RollsEnum.MAKI:
      return calculateMakiPoints(players, resultMap);
    case RollsEnum.TEMAKI:
      return calculateTemakiPoints(players, resultMap);
  }
};

const calculateSpecialPoints = (players: Player[], resultMap: IPointsResult, menu: IMenu) => {
  if (menu.specials.includes(SpecialsEnum.SOY_SAUCE))
    calculateSoySaucePoints(players, resultMap);
  if (menu.specials.includes(SpecialsEnum.WASABI))
    calculateWasabiPoints(players, resultMap);
  if (menu.specials.includes(SpecialsEnum.TEA)) calculateTeaPoints(players, resultMap);
  if (menu.specials.includes(SpecialsEnum.TAKEOUT_BOX))
    calculateTakeoutBoxPoints(players, resultMap);
};

// Roll Functions
const calculateMakiPoints = (players: Player[], resultMap: IPointsResult) => {
  let mostMaki = 0;
  let secondMostMaki = 0;
  const makiCountMap: ICountMap = {};
  const makiPointMap = players.length > 5 ? makiPointsMap.more : makiPointsMap.less;

  players.forEach(player => {
    let makiPoints = 0;
    // Count up the number of maki for the current player
    player.playedCards.forEach(card => {
      if (card.name === RollsEnum.MAKI) {
        makiPoints += card.data;
      }
    });

    // Update current best and second best accordingly
    if (makiPoints > mostMaki) {
      secondMostMaki = mostMaki;
      mostMaki = makiPoints;
    } else if (makiPoints > secondMostMaki && makiPoints < mostMaki) {
      secondMostMaki = makiPoints;
    }
    makiCountMap[player.name] = makiPoints;
  });

  players.forEach(player => {
    const makiPoints = makiCountMap[player.name];

    // Assign points for meeting the best or second best maki count
    if (makiPoints === mostMaki && mostMaki !== 0) {
      player.points += makiPointMap[1];
      resultMap[player.name][RollsEnum.MAKI] = makiPointMap[1];
    } else if (makiPoints === secondMostMaki && secondMostMaki !== 0) {
      player.points += makiPointMap[2];
      resultMap[player.name][RollsEnum.MAKI] = makiPointMap[2];
    }
  });
};

const calculateTemakiPoints = (players: Player[], resultMap: IPointsResult) => {
  let mostTemaki = 0;
  let leastTemaki = 12;
  const temakiCountMap: ICountMap = {};

  players.forEach(player => {
    let temakiPoints = 0;
    // Count number of temaki for a player
    player.playedCards.forEach(card => {
      if (card.name == RollsEnum.TEMAKI) {
        temakiPoints++;
      }
    });

    // Update least and most counters accordingly
    if (temakiPoints > mostTemaki) {
      mostTemaki = temakiPoints;
    }
    if (temakiPoints < leastTemaki) {
      leastTemaki = temakiPoints;
    }
    temakiCountMap[player.name] = temakiPoints;
  });

  if (mostTemaki != leastTemaki) {
    // Assign points as long as most and least don't cancel each other out
    players.forEach(player => {
      const temakiPoints = temakiCountMap[player.name];
      if (temakiPoints === mostTemaki) {
        player.points += 4;
        resultMap[player.name][RollsEnum.TEMAKI] = 4;
      } else if (temakiPoints === leastTemaki && players.length != 2) {
        player.points -= 4;
        resultMap[player.name][RollsEnum.TEMAKI] = -4;
      }
    });
  }
};

// Appetizer Functions
const calculateDumplingPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const dumplings = player.playedCards.filter(
      card => card.name == AppetizersEnum.DUMPLING
    ).length;

    const dumplingPoints = (dumplings > 5) ? 15 : dumplingPointsMap[dumplings];
    player.points += dumplingPoints;
    resultMap[player.name][AppetizersEnum.DUMPLING] = dumplingPoints;
  });
};

const calculateEdamamePoints = (players: Player[], resultMap: IPointsResult) => {
  let totalEdamame = 0;
  let playerEdamameCount = -1;
  const edamameCountMap: ICountMap = {};
  players.forEach(player => {
    totalEdamame = player.playedCards.filter(
      card => card.name == AppetizersEnum.EDAMAME
    ).length;
    if (totalEdamame > 0) {
      playerEdamameCount++;
    }
    edamameCountMap[player.name] = totalEdamame;
  });

  if (playerEdamameCount > 4) {
    playerEdamameCount = 4;
  }

  players.forEach(player => {
    const edamamePoints = playerEdamameCount * edamameCountMap[player.name];
    player.points += edamamePoints;
    resultMap[player.name][AppetizersEnum.EDAMAME] = edamamePoints;
  });
};

const calculateEelPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const eels = player.playedCards.filter(
      card => card.name == AppetizersEnum.EEL
    ).length;
    if (eels === 1) {
      player.points -= 3;
      resultMap[player.name][AppetizersEnum.EEL] = -3;
    } else if (eels > 1) {
      player.points += 7;
      resultMap[player.name][AppetizersEnum.EEL] = 7;
    }
  });
};

const calculateOnigiriPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const onigiri = player.playedCards.filter(
      card => card.name == AppetizersEnum.ONIGIRI
    );
    let square = onigiri.filter(card => card.data === OnigiriNameEnum.SQUARE)
      .length;
    let triangle = onigiri.filter(
      card => card.data === OnigiriNameEnum.TRIANGLE
    ).length;
    let rectangle = onigiri.filter(
      card => card.data === OnigiriNameEnum.RECTANGLE
    ).length;
    let circle = onigiri.filter(card => card.data === OnigiriNameEnum.CIRCLE)
      .length;
    let set = 0, onigiriPoints = 0;
    do {
      set = Number(square > 0) + Number(triangle > 0) + Number(rectangle > 0) + Number(circle > 0);
      switch (set) {
        case 0: {
          onigiriPoints += 0;
          break;
        } // case
        case 1: {
          onigiriPoints += 1;
          break;
        } // case
        case 2: {
          onigiriPoints += 4;
          break;
        } // case
        case 3: {
          onigiriPoints += 9;
          break;
        } // case
        case 4: {
          onigiriPoints += 16;
          break;
        } // case
      } // switch
      square -= 1;
      triangle -= 1;
      rectangle -= 1;
      circle -= 1;
    } while (set != 0);
    
    player.points += onigiriPoints;
    resultMap[player.name][AppetizersEnum.ONIGIRI] = onigiriPoints;
  });
};

const calculateMisoSoupPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    let misoPoints = 0;
    player.playedCards.forEach(c => {
      if (c.name == AppetizersEnum.MISO_SOUP) {
        misoPoints += c.data;
      }
    });
    player.points += misoPoints;
    resultMap[player.name][AppetizersEnum.MISO_SOUP] = misoPoints;
  });
};

const calculateSashimiPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const sashimi = player.playedCards.filter(
      card => card.name == AppetizersEnum.SASHIMI
    ).length;
    const sashimiPoints = Math.floor(sashimi / 3) * 10;
    player.points += sashimiPoints;
    resultMap[player.name][AppetizersEnum.SASHIMI] = sashimiPoints;
  });
};

const calculateTempuraPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const tempura = player.playedCards.filter(
      card => card.name == AppetizersEnum.TEMPURA
    ).length;
    const tempuraPoints = Math.floor(tempura / 2) * 5;
    player.points += tempuraPoints;
    resultMap[player.name][AppetizersEnum.TEMPURA] = tempuraPoints;
  });
};

const calculateTofuPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const tofu = player.playedCards.filter(
      card => card.name == AppetizersEnum.TOFU
    ).length;
    if (tofu === 1) {
      player.points += 2;
      resultMap[player.name][AppetizersEnum.TOFU] = 2;
    } else if (tofu === 2) {
      player.points += 6;
      resultMap[player.name][AppetizersEnum.TOFU] = 6;
    }
  });
};

// Special Functions
const calculateSoySaucePoints = (players: Player[], resultMap: IPointsResult) => {
  let soysaucePlayers = players.filter(
    p => p.playedCards.findIndex(c => c.name == SpecialsEnum.SOY_SAUCE) != -1
  );

  let colourCount = soysaucePlayers.map(p => {
    let map: ICountMap = {};
    p.playedCards.forEach(c => {
      if (c.name.includes('Nigiri') || c.name.includes('Wasabi')) {
        // Count Nigiris and Wasabi as the same colour
        map['Nigiri'] = 1;
      } else {
        map[c.name] = 1;
      }
    });
    return Object.keys(map).length;
  });

  let maxCount = max(colourCount);
  soysaucePlayers.forEach((p, idx) => {
    if (colourCount[idx] === maxCount) {
      let soysauce = p.playedCards.filter(
        card => card.name == SpecialsEnum.SOY_SAUCE
      ).length;
      p.points += 4 * soysauce;
      resultMap[p.name][SpecialsEnum.SOY_SAUCE] = 4 * soysauce;
    }
  });
};

const calculateWasabiPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(player => {
    const wasabi = player.playedCards.filter(
      c => c.name === SpecialsEnum.WASABI
    );
    let wasabiPoints = 0;
    wasabi.forEach(c => {
      wasabiPoints += c.data ? c.data : 0;
    });
    player.points += wasabiPoints;
    resultMap[player.name][SpecialsEnum.WASABI] = wasabiPoints;
  });
};

const calculateTeaPoints = (players: Player[], resultMap: IPointsResult) => {
  let typeCount = players.map(p => {
    let map: ICountMap = {};
    p.playedCards.forEach(c => {
      if (c.name.includes('Nigiri') || c.name.includes('Wasabi')) {
        // Count Nigiris and Wasabi as the same colour
        map['Nigiri'] = map['Nigiri'] ? map['Nigiri'] + 1 : 1;
      } else {
        map[c.name] = map[c.name] ? map[c.name] + 1 : 1;
      }
    });
    return max(Object.values(map)) || 0;
  });

  let maxCount = max(typeCount);
  players.forEach((p, idx) => {
    if (typeCount[idx] === maxCount) {
      let tea = p.playedCards.filter(card => card.name == SpecialsEnum.TEA)
        .length;
      p.points += maxCount * tea;
      resultMap[p.name][SpecialsEnum.TEA] = maxCount * tea;
    }
  });
};

const calculateTakeoutBoxPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(p => {
    const takeoutbox = p.playedCards.filter(
      card => card.name == SpecialsEnum.TAKEOUT_BOX
    ).length;
    p.points += 2 * takeoutbox;
    resultMap[p.name][SpecialsEnum.TAKEOUT_BOX] = 2 * takeoutbox;
  });
};

const calculateGamePoints = (players: Player[], resultMap: IPointsResult, menu: IMenu) => {
  calculateDessertPoints(players, resultMap, menu.dessert);
};

const calculateDessertPoints = (players: Player[], resultMap: IPointsResult, dessertName: DessertsEnum) => {
  switch (dessertName) {
    case DessertsEnum.PUDDING:
      calculatePuddingPoints(players, resultMap);
      break;
    case DessertsEnum.GREEN_TEA_ICE_CREAM:
      calculateIceCreamPoints(players, resultMap);
      break;
    case DessertsEnum.FRUIT:
      calculateFruitPoints(players, resultMap);
      break;
  }
};

const calculatePuddingPoints = (players: Player[], resultMap: IPointsResult) => {
  let puddingCount = players.map(
    p => p.dessertCards.filter(c => c.name === DessertsEnum.PUDDING).length
  );

  const maxCount = max(puddingCount);
  const minCount = min(puddingCount);

  players.forEach((p, idx) => {
    if (puddingCount[idx] === maxCount) {
      p.points += 6;
      resultMap[p.name][DessertsEnum.PUDDING] = 6;
    }

    // 2 player games don't get penalties
    if (puddingCount[idx] === minCount && players.length > 2) {
      p.points -= 6;
      resultMap[p.name][DessertsEnum.PUDDING] = -6;
    }
  });
};

const calculateIceCreamPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(p => {
    let icecream = p.dessertCards.filter(
      c => c.name === DessertsEnum.GREEN_TEA_ICE_CREAM
    ).length;

    const points = Math.floor(icecream / 4) * 12;
    p.points += points;
    resultMap[p.name][DessertsEnum.GREEN_TEA_ICE_CREAM] = points;
  });
};

const calculateFruitPoints = (players: Player[], resultMap: IPointsResult) => {
  players.forEach(p => {
    let fruitCards = p.dessertCards.filter(c => c.name === DessertsEnum.FRUIT);

    let fruitCounts: ICountMap = {
      watermelon: 0,
      pineapple: 0,
      orange: 0,
    };

    fruitCards.forEach(c => {
      const fruitMap: ICountMap = c.data;
      Object.entries(fruitMap).forEach(
        ([key, value]) => (fruitCounts[key] += value)
      );
    });

    Object.values(fruitCounts).forEach(count => {
      const points = fruitPointsMap[count] !== undefined ? fruitPointsMap[count] : fruitPointsMap[5];
      p.points += points;
      resultMap[p.name][DessertsEnum.FRUIT]! += points;
    });
  });
};

export {
  calculateTurnPoints,
  calculateRoundPoints,
  calculateGamePoints,
  createEmptyResultMap,
}
