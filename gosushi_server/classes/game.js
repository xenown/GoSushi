const CardNameEnum = require('../util/cardNameEnum');
const Player = require('./player');
const Deck = require('./deck');
const handSize = require('../util/handSize');
const { makiPoints, uramakiPoints } = require('../util/pointRules');

class Game {
  constructor(menu, playerNum, roomCode, hostPlayer, socketId) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.hostPlayer = new Player(hostPlayer, socketId);
    this.players = [this.hostPlayer];
    this.round = 1;
    this.hands = [];
    this.uramakiCountMap = {};
    this.uramakiStanding = 1;
  }

  addPoints(playerName, points) {
    this.players.find(playerName).points += points;
  }

  startRound() {
    const dessertsMap =
      this.numPlayers > 6 ? numDesserts.more : numDesserts.less;
    this.deck.resetDeck(dessertsMap[this.round]);
    const { menu } = this.deck;

    this.deck.shuffle();

    if (menu.roll === CardNameEnum.URAMAKI)
      this.players.forEach(p => (this.uramakiCountMap[p.name] = 0));

    const hands = [];
    for (let i = 0; i < this.numPlayers; i++) {
      const temp = this.deck.dealHand(handSize[this.numPlayers]);
      hands.push(temp);
    }
    this.rotateHands(hands);
  }

  getPlayerHands() {
    return this.players.map(p => p.hand);
  }

  rotateHands(hands) {
    const firstHand = hands.shift();
    hands.push(firstHand);
    this.players.map((p, idx) => (p.hand = hands[idx]));
  }

  sumCardData(cardName, player) {
    return player.playedCards.reduce(
      (accum, curr) => (accum += curr.cardName === cardName ? curr.data : 0)
    );
  }

  calculateTurnPoints() {
    this.players.forEach(currPlyr => {
      while (currPlyr.turnCards.length !== 0) {
        const card = currPlyr.turnCards.pop();
        switch (card.cardName) {
          case CardNameEnum.MISO_SOUP:
            const repeats = this.players.filter(
              otherPlyr =>
                otherPlyr.name !== currPlyr.name &&
                otherPlyrs.turnCards.find(
                  c => c.cardName === CardNameEnum.MISO_SOUP
                )
            );
            const value = repeats.length !== 0 ? 3 : 0;
            repeats.forEach(repeat => {
              const miso = _.remove(
                repeat.turnCards,
                el => el.cardName === CardNameEnum.MISO_SOUP
              );
              miso.data = value;
              repeat.playedCards.push(miso);
            });
            card.data = value;
            break;
          case CardNameEnum.URAMAKI:
            gotUramakiMap[currPlyr.name] += card.data;
            break;
          default:
            break;
        }
        currPlyr.playedCards.push(card);
      }
    });

    if (this.menu.roll === CardNameEnum.URAMAKI && this.uramakiStanding <= 3) {
      const overTenArray = Object.entries(this.uramakiCountMap)
        .filter(el => el[1] >= 10)
        .sort((el1, el2) => el2[1] - el1[1]);

      const prevValue = 0;
      const equivStanding = 0;
      overTenArray.forEach((name, value) => {
        if (this.uramakiStanding <= 3) {
          equivStanding = this.uramakiStanding;
          if (value === prevValue) {
            equivStanding = this.uramakiStanding - 1;
          }
          this.addPoints(name, uramakiPoints[equivStanding]);
          this.uramakiCountMap[name] = 0;
          this.uramakiStanding++;
        }
        prevValue = value;
      });
    }
  }

  calculateRoundPoints() {
    // score normal foods
  }

  calculateEndPoints() {
    // Desserts
  }
}

module.exports = Game;

const numDesserts = {
  less: {
    1: 5,
    2: 3,
    3: 2,
  },
  more: {
    1: 7,
    2: 5,
    3: 3,
  },
};
