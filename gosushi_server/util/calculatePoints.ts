import { find, max, min, remove } from 'lodash';
import Player from '../classes/player';
import CardNameEnum from '../types/cardNameEnum';
import OnigiriNameEnum from '../types/onigiriNameEnum';
import { ICountMap, IUramakiStanding } from '../types/IPoints';
import IMenu from '../types/IMenu';
import {
  makiPoints,
  uramakiPoints,
  dumplingPoints,
  fruitPoints,
} from '../util/pointRules';

const addPlayerPoints = (playerName: string, players: Player[], points: number) => {
  find(players, p => p.name === playerName)!.points += points;
};

const calculateTurnPoints = (players: Player[], menu: IMenu, uramakiCountMap: ICountMap, uramakiStanding: IUramakiStanding) => {
  players.forEach(currPlyr => {
    // Get list of unused wasabi cards
    let wasabi = currPlyr.playedCards.filter(
      card => card.name === CardNameEnum.WASABI && !card.data
    );
    while (currPlyr.turnCards.length !== 0) {
      const card = currPlyr.turnCards.pop()!;
      switch (card.name) {
        case CardNameEnum.EGG:
          // Update wasabi with score to triple the nigiri's value
          if (wasabi.length > 0) {
            wasabi[0].data = 2;
            // Shift the used wasabi out of the list of unused wasabis
            wasabi.shift();
          }
          break;
        case CardNameEnum.SALMON:
          if (wasabi.length > 0) {
            wasabi[0].data = 4;
            wasabi.shift();
          }
          break;
        case CardNameEnum.SQUID:
          if (wasabi.length > 0) {
            wasabi[0].data = 6;
            wasabi.shift();
          }
          break;
        case CardNameEnum.MISO_SOUP:
          // Find all other players that played a miso (including yourself)
          const repeats = players.filter(p =>
            // the current card has been popped out of your own turnCards, so we can check in this way
            p.turnCards.find(c => c.name === CardNameEnum.MISO_SOUP)
          );

          const value = repeats.length !== 0 ? 0 : 3;
          repeats.forEach(repeat => {
            // Update all player's miso cards (besides current card) accordingly and put them into playedCards
            const miso = remove(
              repeat.turnCards,
              el => el.name === CardNameEnum.MISO_SOUP
            );
            miso.forEach(c => (c.data = value));
            repeat.playedCards = repeat.playedCards.concat(miso);
          });
          // Update current player's card
          card.data = value;
          break;
        case CardNameEnum.URAMAKI:
          // Count the current player's uramaki points
          uramakiCountMap[currPlyr.name] += card.data;
          break;
        default:
          break;
      }
      currPlyr.playedCards.push(card);
    }
  });

  if (menu.roll === CardNameEnum.URAMAKI && uramakiStanding.value <= 3) {
    calculateUramakiPoints(players, uramakiCountMap, uramakiStanding);
  }
}; // calculateTurnPoints

const calculateUramakiPoints = (players: Player[], uramakiCountMap: ICountMap, uramakiStanding: IUramakiStanding) => {
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
      addPlayerPoints(el[0], players, uramakiPoints[equivStanding]);
      uramakiCountMap[el[0]] = 0;
      uramakiStanding.value++;
    }
    prevValue = el[1];
    equivStanding++;
  });
}; // calculateUramakiPoints

// Base Function
const calculateRoundPoints = (players: Player[], menu: IMenu) => {
  calculateNigiriPoints(players);
  calculateAppetizerPoints(players, menu);
  calculateRollPoints(players, menu);
  calculateSpecialPoints(players, menu);
}; // calculateRoundPoints

// Hierarchy Functions
const calculateNigiriPoints = (players: Player[]) => {
  players.forEach(player => {
    player.points +=
      player.playedCards.filter(card => card.name == CardNameEnum.EGG).length +
      player.playedCards.filter(card => card.name == CardNameEnum.SALMON)
        .length *
        2 +
      player.playedCards.filter(card => card.name == CardNameEnum.SQUID)
        .length *
        3;
  });
}; // calculateNigiriPoints

const calculateAppetizerPoints = (players: Player[], menu: IMenu) => {
  if (menu.appetizers.includes(CardNameEnum.DUMPLING)) {
    calculateDumplingPoints(players);
  }
  if (menu.appetizers.includes(CardNameEnum.EDAMAME)) {
    calculateEdamamePoints(players);
  }
  if (menu.appetizers.includes(CardNameEnum.EEL)) {
    calculateEelPoints(players);
  }
  if (menu.appetizers.includes(CardNameEnum.ONIGIRI)) {
    calculateOnigiriPoints(players);
  }
  if (menu.appetizers.includes(CardNameEnum.MISO_SOUP)) {
    calculateMisoSoupPoints(players);
  }
  if (menu.appetizers.includes(CardNameEnum.SASHIMI)) {
    calculateSashimiPoints(players);
  }
  if (menu.appetizers.includes(CardNameEnum.TEMPURA)) {
    calculateTempuraPoints(players);
  }
  if (menu.appetizers.includes(CardNameEnum.TOFU)) {
    calculateTofuPoints(players);
  }
}; // calculateAppetizerPoints

const calculateRollPoints = (players: Player[], menu: IMenu) => {
  switch (menu.roll) {
    case CardNameEnum.MAKI:
      return calculateMakiPoints(players);
    case CardNameEnum.TEMAKI:
      return calculateTemakiPoints(players);
  }
};

const calculateSpecialPoints = (players: Player[], menu: IMenu) => {
  if (menu.specials.includes(CardNameEnum.SOY_SAUCE))
    calculateSoySaucePoints(players);
  if (menu.specials.includes(CardNameEnum.WASABI))
    calculateWasabiPoints(players);
  if (menu.specials.includes(CardNameEnum.TEA)) calculateTeaPoints(players);
  if (menu.specials.includes(CardNameEnum.TAKEOUT_BOX))
    calculateTakeoutBoxPoints(players);
};

// Roll Functions
const calculateMakiPoints = (players: Player[]) => {
  let mostMaki = 0;
  let secondMostMaki = 0;
  const makiCountMap: ICountMap = {};
  const makiPointMap = players.length > 5 ? makiPoints.more : makiPoints.less;

  players.forEach(player => {
    let makiPoints = 0;
    // Count up the number of maki for the current player
    player.playedCards.forEach(card => {
      if (card.name === CardNameEnum.MAKI) {
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
    } else if (makiPoints === secondMostMaki && secondMostMaki !== 0) {
      player.points += makiPointMap[2];
    }
  });
};

const calculateTemakiPoints = (players: Player[]) => {
  let mostTemaki = 0;
  let leastTemaki = 12;
  const temakiCountMap: ICountMap = {};

  players.forEach(player => {
    let temakiPoints = 0;
    // Count number of temaki for a player
    player.playedCards.forEach(card => {
      if (card.name == CardNameEnum.TEMAKI) {
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
      } else if (temakiPoints === leastTemaki && players.length != 2) {
        player.points -= 4;
      }
    });
  }
};

// Appetizer Functions
const calculateDumplingPoints = (players: Player[]) => {
  players.forEach(player => {
    const dumplings = player.playedCards.filter(
      card => card.name == CardNameEnum.DUMPLING
    ).length;

    if (dumplings > 5) {
      player.points += 15;
    } else {
      player.points += dumplingPoints[dumplings];
    }
  });
};

const calculateEdamamePoints = (players: Player[]) => {
  let totalEdamame = 0;
  let playerEdamameCount = -1;
  const edamameCountMap: ICountMap = {};
  players.forEach(player => {
    totalEdamame = player.playedCards.filter(
      card => card.name == CardNameEnum.EDAMAME
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
    player.points += playerEdamameCount * edamameCountMap[player.name];
  });
};

const calculateEelPoints = (players: Player[]) => {
  players.forEach(player => {
    const eels = player.playedCards.filter(
      card => card.name == CardNameEnum.EEL
    ).length;
    if (eels === 1) {
      player.points -= 3;
    } else if (eels > 1) {
      player.points += 7;
    }
  });
};

const calculateOnigiriPoints = (players: Player[]) => {
  players.forEach(player => {
    const onigiri = player.playedCards.filter(
      card => card.name == CardNameEnum.ONIGIRI
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
    let set = 0;
    do {
      set = Number(square > 0) + Number(triangle > 0) + Number(rectangle > 0) + Number(circle > 0);
      switch (set) {
        case 0: {
          player.points += 0;
          break;
        }
        case 1: {
          player.points += 1;
          break;
        }
        case 2: {
          player.points += 4;
          break;
        }
        case 3: {
          player.points += 9;
          break;
        }
        case 4: {
          player.points += 16;
          break;
        }
      }
      square -= 1;
      triangle -= 1;
      rectangle -= 1;
      circle -= 1;
    } while (set != 0);
  });
};

const calculateMisoSoupPoints = (players: Player[]) => {
  players.forEach(player => {
    player.playedCards.forEach(c => {
      if (c.name == CardNameEnum.MISO_SOUP) {
        player.points += c.data;
      }
    });
  });
};

const calculateSashimiPoints = (players: Player[]) => {
  players.forEach(player => {
    const sashimi = player.playedCards.filter(
      card => card.name == CardNameEnum.SASHIMI
    ).length;
    player.points += Math.floor(sashimi / 3) * 10;
  });
};

const calculateTempuraPoints = (players: Player[]) => {
  players.forEach(player => {
    const tempura = player.playedCards.filter(
      card => card.name == CardNameEnum.TEMPURA
    ).length;
    player.points += Math.floor(tempura / 2) * 5;
  });
};

const calculateTofuPoints = (players: Player[]) => {
  players.forEach(player => {
    const tofu = player.playedCards.filter(
      card => card.name == CardNameEnum.TOFU
    ).length;
    if (tofu === 1) {
      player.points += 2;
    } else if (tofu === 2) {
      player.points += 6;
    }
  });
};

// Special Functions
const calculateSoySaucePoints = (players: Player[]) => {
  let soysaucePlayers = players.filter(
    p => p.playedCards.findIndex(c => c.name == CardNameEnum.SOY_SAUCE) != -1
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
        card => card.name == CardNameEnum.SOY_SAUCE
      ).length;
      p.points += 4 * soysauce;
    }
  });
};

const calculateWasabiPoints = (players: Player[]) => {
  players.forEach(player => {
    const wasabi = player.playedCards.filter(
      c => c.name === CardNameEnum.WASABI
    );
    wasabi.forEach(c => {
      player.points += c.data ? c.data : 0;
    });
  });
};

const calculateTeaPoints = (players: Player[]) => {
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
      let tea = p.playedCards.filter(card => card.name == CardNameEnum.TEA)
        .length;
      p.points += maxCount * tea;
    }
  });
};

const calculateTakeoutBoxPoints = (players: Player[]) => {
  players.forEach(p => {
    const takeoutbox = p.playedCards.filter(
      card => card.name == CardNameEnum.TAKEOUT_BOX
    ).length;
    p.points += 2 * takeoutbox;
  });
};

const calculateGamePoints = (players: Player[], menu: IMenu) => {
  calculateDessertPoints(players, menu.dessert);
};

const calculateDessertPoints = (players: Player[], dessertName: CardNameEnum) => {
  switch (dessertName) {
    case CardNameEnum.PUDDING:
      calculatePuddingPoints(players);
      break;
    case CardNameEnum.GREEN_TEA_ICE_CREAM:
      calculateIceCreamPoints(players);
      break;
    case CardNameEnum.FRUIT:
      calculateFruitPoints(players);
      break;
  }
};

const calculatePuddingPoints = (players: Player[]) => {
  let puddingCount = players.map(
    p => p.dessertCards.filter(c => c.name === CardNameEnum.PUDDING).length
  );

  const maxCount = max(puddingCount);
  const minCount = min(puddingCount);

  players.forEach((p, idx) => {
    if (puddingCount[idx] === maxCount) {
      p.points += 6;
    }

    // 2 player games don't get penalties
    if (puddingCount[idx] === minCount && players.length > 2) {
      p.points -= 6;
    }
  });
};

const calculateIceCreamPoints = (players: Player[]) => {
  players.forEach(p => {
    let icecream = p.dessertCards.filter(
      c => c.name === CardNameEnum.GREEN_TEA_ICE_CREAM
    ).length;

    p.points += Math.floor(icecream / 4) * 12;
  });
};

const calculateFruitPoints = (players: Player[]) => {
  players.forEach(p => {
    let fruitCards = p.dessertCards.filter(c => c.name === CardNameEnum.FRUIT);

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
      p.points +=
        fruitPoints[count] !== undefined ? fruitPoints[count] : fruitPoints[5];
    });
  });
};

export {
  calculateTurnPoints,
  calculateRoundPoints,
  calculateGamePoints
}
