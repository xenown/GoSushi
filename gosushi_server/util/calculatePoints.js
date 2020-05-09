const cardNameEnum = require('./cardNameEnum');
const onigiriNameEnum = require('./onigiriNameEnum');

// Base Function
calculateRoundPoints = (players, menu) => {
    calculateNigiriPoints(players);
    calculateAppetizersPoints(players, menu);
    calculateRollsPoints(players, menu);
    calculateSpecialPoints(players, menu);
}

// Hierarchy Functions
calculateNigiriPoints = (players) => {
    players.forEach(player => {
        player.points += player.cards.filter(card => card.name == cardNameEnum.EGG).length + 
            player.cards.filter(card => card.name == cardNameEnum.SALMON).length * 2 + 
            player.cards.filter(card => card.name == cardNameEnum.SQUID).length * 3;
    })
    
}
calculateAppetizersPoints = (players, menu) => {
    if (menu.appetizer.contains(cardNameEnum.DUMPLING)) calculateDumplingPoints(players);
    if (menu.appetizer.contains(cardNameEnum.EDAMAMEG)) calculateEdamamePoints(players);
    if (menu.appetizer.contains(cardNameEnum.EEL)) calculateEelPoints(players);
    if (menu.appetizer.contains(cardNameEnum.ONIGIRI)) calculateOnigiriPoints(players);
    if (menu.appetizer.contains(cardNameEnum.SASHIMI)) calculateSashimiPoints(players);
    if (menu.appetizer.contains(cardNameEnum.TEMPURA)) calculateTempuraPoints(players);
    if (menu.appetizer.contains(cardNameEnum.TOFU)) calculateTofuPoints(players);
}
calculateRollsPoints = (players, menu) => {
    switch (menu.roll) {
        case cardNameEnum.MAKI: return calculateMakiPoints(players);
        case cardNameEnum.TEMAKI: return calculateTemakiPoints(players);
    }
}
calculateSpecialsPoints = (players, menu) => {
    if (menu.specials.contains(cardNameEnum.SOY_SAUCE)) calculateSoySaucePoints(players);
    if (menu.specials.contains(cardNameEnum.WASABI)) calculateWasabiPoints(players);
    if (menu.specials.contains(cardNameEnum.TEA)) calculateTeaPoints(players);
    if (menu.specials.contains(cardNameEnum.TAKEOUT_BOX)) calculateTakeoutBoxPoints(players);
}

//Roll Functions
calculateMakiPoints = (players) => {
    const mostMaki = 0;
    const secondMostMaki = 0;
    const thirdMostMaki = 0;
    players.forEach(player => {
        const makiPoints = 0;
        player.cards.forEach(card => {
            if (card.name == cardNameEnum.MAKI) {
                makiPoints += card.data;
            }
        })
        if (makiPoints > mostMaki) {
            thirdMostMaki = secondMostMaki;
            secondMostMaki = mostMaki;
            mostMaki = makiPoints;
        } else if (makiPoints > secondMostMaki) {
            thirdMostMaki = secondMostMaki;
            secondMostMaki = makiPoints;
        } else if (makiPoints > thirdMostMaki) {
            thirdMostMaki = makiPoints;
        }
    })
    players.forEach(player => {
        const makiPoints = 0;
        player.cards.forEach(card => {
            if (card.name == cardNameEnum.MAKI) {
                makiPoints += card.data;
            }
        })
        if (makiPoints === mostMaki) {
            player.points += 6;
        } else if (makiPoints === secondMostMaki) {
            player.points += (players.length > 5)? 4 : 3;
        } else if (makiPoints === thirdMostMaki && players.length > 5) {
            player.points += 2;
        }
    })
}
calculateTemakiPoints = (players) => {
    const mostTemaki = 0;
    const leastTemaki = 0;
    players.forEach(player => {
        const temakiPoints = 0;
        player.cards.forEach(card => {
            if (card.name == cardNameEnum.TEMAKI) {
                temakiPoints += card.data;
            }
        })
        if (temakiPoints > mostTemaki) {
            mostTemaki = temakiPoints;
        }
        if (temakiPoints < leastTemaki) {
            leastTemaki = temakiPoints;
        }
    })
    if (mostTemaki != leastTemaki) {
        players.forEach(player => {
            const temakiPoints = 0;
            player.cards.forEach(card => {
                if (card.name == cardNameEnum.TEMAKI) {
                    temakiPoints += card.data;
                }
            })
            if (temakiPoints === mostTemaki) {
                player.points += 4;
            } else if (temakiPoints === leastTemaki && players.legnth != 2) {
                temakiPoints -= 4;
            }
        })
    }
}

//Appetizer Functions
calculateDumplingPoints = (players) => {
    players.forEach(player => {
        const dumplings = player.cards.filter(card => card.name == cardNameEnum.DUMPLING).length
        switch (dumplings) {
            case 0: { player.points += 0; break; }
            case 1: { player.points += 1; break; }
            case 2: { player.points += 3; break; }
            case 3: { player.points += 6; break; }
            case 4: { player.points += 10; break; }
            case 5: { player.points += 15; break; }
            default:  { player.points += 15; break; }
        }
    })
}

calculateEdamamePoints = (players) => {
    const totalEdamame = 0;
    players.forEach(player => {
        totalEdamame = player.cards.filter(card => card.name == cardNameEnum.EDAMAME).length
    });
    players.forEach(player => {
        playerEdamame = player.cards.filter(card => card.name == cardNameEnum.EDAMAME).length
        players.points += (totalEdamame - playerEdamame) * playerEdamame;
    });
}
calculateEelPoints = (players) => {
    players.forEach(player => {
        const eels = player.cards.filter(card => card.name == cardNameEnum.EEL).length
        if (eels === 1) {
            player.points -= 3;
        } else if (eels > 1) {
            player.points += 7;
        }
    })
}
calculateOnigiriPoints = (players) => {
    players.forEach(player => {
        const onigiri = player.cards.filter(card => card.name == cardNameEnum.ONIGIRI);
        const square = onigiri.filter(card => card.data === onigiriNameEnum.SQUARE);
        const triangle = onigiri.filter(card => card.data === onigiriNameEnum.TRIANGLE)
        const rectangle = onigiri.filter(card => card.data === onigiriNameEnum.RECTANGLE)
        const circle = onigiri.filter(card => card.data === onigiriNameEnum.CIRCLE)
        let set = 0;
        do {
            set = (square > 0) + (triangle > 0) + (rectangle > 0) + (circle > 0);
            switch (set) {
                case 0: {player.points += 0; break;}
                case 1: {player.points += 1; break;}
                case 2: {player.points += 4; break;}
                case 3: {player.points += 9; break;}
                case 4: {player.points += 16; break;}
            }
            square -= 1;
            triangle -= 1;
            rectangle -= 1;
            circle -= 1;

        } while (set != 0);
    })
}
calculateSashimiPoints = (players) => {
    players.forEach(player => {
        const sashimi = player.cards.filter(card => card.name == cardNameEnum.SASHIMI).length
        player.points += Math.floor(sashimi/3) * 10
    })
}
calculateTempuraPoints = (players) => {
    players.forEach(player => {
        const tempura = player.cards.filter(card => card.name == cardNameEnum.TEMPURA).length
        player.points += Math.floor(tempura/2) * 5
    })
}
calculateTofuPoints = (players) => {
    players.forEach(player => {
        const tofu = player.cards.filter(card => card.name == cardNameEnum.TOFU).length
        if (tofu === 1) {
            player.points += 2;
        } else if (tofu === 2) {
            player.points += 6;
        }
    })
}

//Special Functions
calculateSoySaucePoints = (players) => {
    
}
calculateWasabiPoints = (players) => {
    
}
calculateTeaPoints = (players) => {
    
}
calculateTakeoutBoxPoints = (players) => {
    
}


module.exports = {
    calculateRoundPoints,
}