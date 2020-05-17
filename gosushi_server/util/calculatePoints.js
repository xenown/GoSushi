const _ = require('lodash');
const cardNameEnum = require('./cardNameEnum');
const onigiriNameEnum = require('./onigiriNameEnum');
const { makiPoints, uramakiPoints, dumplingPoints } = require('../util/pointRules');

const addPoints = (playerName, players, points) => {
  _.find(players, p => p.name === playerName).points += points;
}

calculateTurnPoints = (
  players,
  menu,
  uramakiCountMap,
  uramakiStanding,
) => {
  players.forEach(currPlyr => {
    while (currPlyr.turnCards.length !== 0) {
      const card = currPlyr.turnCards.pop();
      switch (card.name) {
        case cardNameEnum.MISO_SOUP:
          const repeats = players.filter(
            otherPlyr =>
              otherPlyr.name !== currPlyr.name &&
              otherPlyr.turnCards.find(
                c => c.name === cardNameEnum.MISO_SOUP
              )
          );
          const value = repeats.length !== 0 ? 0 : 3;
          repeats.forEach(repeat => {
            const miso = _.remove(
              repeat.turnCards,
              el => el.name === cardNameEnum.MISO_SOUP
            );
            miso.data = value;
            repeat.playedCards.push(miso);
          });
          card.data = value;
          break;
        case cardNameEnum.URAMAKI:
          uramakiCountMap[currPlyr.name] += card.data;
          break;
        default:
          break;
      }
      currPlyr.playedCards.push(card);
    }
  });

  if (menu.roll === cardNameEnum.URAMAKI && uramakiStanding.value <= 3) {
    calculateUramakiPoints(players, uramakiCountMap, uramakiStanding);
  }
};

calculateUramakiPoints = (players, uramakiCountMap, uramakiStanding) => {
  const isLastTurnInRound = players[0].hand.length === 0; // no cards left
  const potentialWinners = Object.entries(uramakiCountMap)
    .filter(el => isLastTurnInRound ? true : el[1] >= 10)
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
      addPoints(el[0], players, uramakiPoints[equivStanding]);
      uramakiCountMap[el[0]] = 0;
      uramakiStanding.value++;
    }
    prevValue = el[1];
    equivStanding++;
  });
}

// Base Function
calculateRoundPoints = (players, menu) => {
  calculateNigiriPoints(players);
  calculateAppetizerPoints(players, menu);
  calculateRollPoints(players, menu);
  calculateSpecialPoints(players, menu);
};

// Hierarchy Functions
calculateNigiriPoints = players => {
  players.forEach(player => {
    player.points +=
      player.playedCards.filter(card => card.name == cardNameEnum.EGG).length +
      player.playedCards.filter(card => card.name == cardNameEnum.SALMON).length * 2 +
      player.playedCards.filter(card => card.name == cardNameEnum.SQUID).length * 3;
  });
};

calculateAppetizerPoints = (players, menu) => {
  if (menu.appetizers.includes(cardNameEnum.DUMPLING))
    calculateDumplingPoints(players);
  if (menu.appetizers.includes(cardNameEnum.EDAMAME))
    calculateEdamamePoints(players);
  if (menu.appetizers.includes(cardNameEnum.EEL)) calculateEelPoints(players);
  if (menu.appetizers.includes(cardNameEnum.ONIGIRI))
    calculateOnigiriPoints(players);
  if (menu.appetizers.includes(cardNameEnum.MISO_SOUP))
    calculateMisoSoupPoints(players);
  if (menu.appetizers.includes(cardNameEnum.SASHIMI))
    calculateSashimiPoints(players);
  if (menu.appetizers.includes(cardNameEnum.TEMPURA))
    calculateTempuraPoints(players);
  if (menu.appetizers.includes(cardNameEnum.TOFU)) calculateTofuPoints(players);
};

calculateRollPoints = (players, menu) => {
  switch (menu.roll) {
    case cardNameEnum.MAKI:
      return calculateMakiPoints(players);
    case cardNameEnum.TEMAKI:
      return calculateTemakiPoints(players);
  }
};

calculateSpecialPoints = (players, menu) => {
  if (menu.specials.includes(cardNameEnum.SOY_SAUCE))
    calculateSoySaucePoints(players);
  if (menu.specials.includes(cardNameEnum.WASABI))
    calculateWasabiPoints(players);
  if (menu.specials.includes(cardNameEnum.TEA)) calculateTeaPoints(players);
  if (menu.specials.includes(cardNameEnum.TAKEOUT_BOX))
    calculateTakeoutBoxPoints(players);
};

//Roll Functions
calculateMakiPoints = players => {
  let mostMaki = 0;
  let secondMostMaki = 0;
  const makiCountMap = {};
  const makiPointMap =
    players.length > 5 ? makiPoints.more : makiPoints.less;

  players.forEach(player => {
    let makiPoints = 0;
    player.playedCards.forEach(card => {
      if (card.name == cardNameEnum.MAKI) {
        makiPoints += card.data;
      }
    });
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
    if (makiPoints === mostMaki && mostMaki !== 0) {
      player.points += makiPointMap[1];
    } else if (makiPoints === secondMostMaki && secondMostMaki !== 0) {
      player.points += makiPointMap[2]
    }
  });
};

calculateTemakiPoints = players => {
  let mostTemaki = 0;
  let leastTemaki = 12;
  const temakiCountMap = {};

  players.forEach(player => {
    let temakiPoints = 0;
    player.playedCards.forEach(card => {
      if (card.name == cardNameEnum.TEMAKI) {
        temakiPoints++;
      }
    });
    if (temakiPoints > mostTemaki) {
      mostTemaki = temakiPoints;
    }
    if (temakiPoints < leastTemaki) {
      leastTemaki = temakiPoints;
    }
    temakiCountMap[player.name] = temakiPoints;
  });

  if (mostTemaki != leastTemaki) {
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

//Appetizer Functions
calculateDumplingPoints = players => {
  players.forEach(player => {
    const dumplings = player.playedCards.filter(
      card => card.name == cardNameEnum.DUMPLING
    ).length;

    if (dumplings > 5) {
      player.points += 15;
    } else {
      player.points += dumplingPoints[dumplings];
    }
  });
};

calculateEdamamePoints = players => {
  let totalEdamame = 0;
  let playerEdamameCount = -1;
  const edamameCountMap = {};
  players.forEach(player => {
    totalEdamame = player.playedCards.filter(
      card => card.name == cardNameEnum.EDAMAME
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

calculateEelPoints = players => {
  players.forEach(player => {
    const eels = player.playedCards.filter(card => card.name == cardNameEnum.EEL)
      .length;
    if (eels === 1) {
      player.points -= 3;
    } else if (eels > 1) {
      player.points += 7;
    }
  });
};

calculateOnigiriPoints = players => {
  players.forEach(player => {
    const onigiri = player.playedCards.filter(
      card => card.name == cardNameEnum.ONIGIRI
    );
    const square = onigiri.filter(card => card.data === onigiriNameEnum.SQUARE);
    const triangle = onigiri.filter(
      card => card.data === onigiriNameEnum.TRIANGLE
    );
    const rectangle = onigiri.filter(
      card => card.data === onigiriNameEnum.RECTANGLE
    );
    const circle = onigiri.filter(card => card.data === onigiriNameEnum.CIRCLE);
    let set = 0;
    do {
      set = (square > 0) + (triangle > 0) + (rectangle > 0) + (circle > 0);
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

calculateMisoSoupPoints = players => {
  players.forEach(player => {
    player.playedCards.forEach(c => {
      if (c.name == cardNameEnum.MISO_SOUP) {
        player.points += c.data;
      }
    });
  });
};

calculateSashimiPoints = players => {
  players.forEach(player => {
    const sashimi = player.playedCards.filter(
      card => card.name == cardNameEnum.SASHIMI
    ).length;
    player.points += Math.floor(sashimi / 3) * 10;
  });
};

calculateTempuraPoints = players => {
  players.forEach(player => {
    const tempura = player.playedCards.filter(
      card => card.name == cardNameEnum.TEMPURA
    ).length;
    player.points += Math.floor(tempura / 2) * 5;
  });
};

calculateTofuPoints = players => {
  players.forEach(player => {
    const tofu = player.playedCards.filter(card => card.name == cardNameEnum.TOFU)
      .length;
    if (tofu === 1) {
      player.points += 2;
    } else if (tofu === 2) {
      player.points += 6;
    }
  });
};

//Special Functions
calculateSoySaucePoints = players => { };
calculateWasabiPoints = players => { };
calculateTeaPoints = players => { };
calculateTakeoutBoxPoints = players => { };

module.exports = {
  calculateTurnPoints,
  calculateRoundPoints,
};
