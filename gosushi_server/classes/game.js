const _ = require('lodash');
const CardNameEnum = require('../util/cardNameEnum');
const Player = require('./player');
const Deck = require('./deck');
const handSize = require('../util/handSize');
const {
  calculateTurnPoints,
  calculateRoundPoints,
  calculateGamePoints,
} = require('../util/calculatePoints');
const {
  specialActionsHand,
  specialActionsPlayed,
} = require('../util/cardCategories');
const Card = require('./card');

class Game {
  constructor(menu, playerNum, roomCode, hostPlayer, socketId) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.hostPlayer = new Player(hostPlayer, socketId);
    this.players = [this.hostPlayer];
    this.round = 1;
    this.hands = [];
    this.playedTurn = 0;
    this.uramakiCountMap = {};
    this.uramakiStanding = { value: 1 };
    this.isAutoPlayers = false;
    this.hasAutoPlayedTurn = false;
    this.specialActions = [];
  }

  addPlayer(name, socketId) {
    this.players.push(new Player(name, socketId));
  }

  checkForSpecialActions() {
    const isInSpecialActions = (newCard, newPlayerName) =>
      this.specialActions.findIndex(
        obj => _.isEqual(obj.card, newCard) && obj.name === newPlayerName
      ) !== -1;

    this.players.forEach(p => {
      p.turnCards.forEach(card => {
        // checks for special cards that activate when played
        if (
          specialActionsHand.includes(card.name) &&
          !isInSpecialActions(card, p.name)
        ) {
          this.specialActions.push({ card: card, playerName: p.name });
        }
      });

      p.turnCardsReuse.forEach(card => {
        // check for special cards that are used on a turn after they were initialy played/flipped
        if (
          specialActionsPlayed.includes(card.name) &&
          !isInSpecialActions(card, p.name)
        ) {
          this.specialActions.push({ card: card, playerName: p.name });
        }
      });
    });

    this.specialActions.sort((i1, i2) => i1.card.data - i2.card.data);
  }

  finishedTurn(sendPlayerData, notifySpecialAction, sendGameResults) {
    this.playedTurn++;
    if (this.playedTurn === this.numPlayers || this.isAutoPlayers) {
      // if auto playing, if the auto players haven't done an initial action yet, play cards
      if (this.isAutoPlayers && !this.hasAutoPlayedTurn) {
        this.players.forEach((p, idx) => {
          if (idx > 0) {
            p.playCardFromHand(p.hand[0]);
          }
        });
        this.hasAutoPlayedTurn = true;
      }

      this.checkForSpecialActions();
      if (this.specialActions.length > 0) {
        this.playedTurn -= 1;

        let { card, playerName } = this.specialActions.shift();

        // console.log(`player ${playerName} plays special card: ${card.name}`);

        let index = this.players.findIndex(p => p.name === playerName);
        let data = this.getSpecialData(playerName, card);

        if (this.isAutoPlayers && index !== 0) {
          this.handleSpecialAction(this.players[index], card, data[0]);
          this.finishedTurn(
            sendPlayerData,
            notifySpecialAction,
            sendGameResults
          );
        } else {
          notifySpecialAction(
            playerName,
            this.players,
            card,
            this.getSpecialData(playerName, card)
          );
        }

        // TODO: notify others to wait for 'playerName' player to finish 'card.name' action
      } else {
        this.playedTurn = 0;
        this.hasAutoPlayedTurn = false;
        this.handleFinishedTurnActions(sendPlayerData, sendGameResults);
      }
    }
  }

  handleFinishedTurnActions(sendPlayerData, sendGameResults) {
    calculateTurnPoints(
      this.players,
      this.deck.menu,
      this.uramakiCountMap,
      this.uramakiStanding
    );
    let tempPlayers = [];
    this.rotateHands(this.players.map(p => p.hand));
    if (this.players[0].hand.length === 0) {
      // no more cards in the hand
      calculateRoundPoints(this.players, this.deck.menu);

      // empty the playedCards and moved the dessert cards
      this.players.forEach(p => {
        p.dessertCards = p.dessertCards.concat(
          p.playedCards.filter(c => c.name === this.deck.menu.dessert)
        );
        p.playedCards = [];
      });

      if (this.round < 3) {
        // go to next round
        this.round++;
        console.log('End of round');

        // remove and add desserts
        this.startRound();
        tempPlayers = this.getPlayersData();
        this.players.forEach(p => {
          sendPlayerData(p.socketId, p.hand, tempPlayers);
          tempPlayers.push(tempPlayers.shift());
        });
      } else {
        this.handleEndGame(sendPlayerData, sendGameResults);
      }
    } else {
      tempPlayers = this.getPlayersData();
      this.players.forEach(p => {
        sendPlayerData(p.socketId, p.hand, tempPlayers);
        tempPlayers.push(tempPlayers.shift());
      });
    }
  }

  // get the data that needs to be sent to the front-end, only clone necessary information
  getPlayersData() {
    let tempPlayers = [];
    const notCloned = ['hand', 'turnCards', 'makiCount', 'uramakiCount'];
    this.players.forEach(p =>
      tempPlayers.push(_.cloneDeepWith(_.omit(p, notCloned)))
    );
    return tempPlayers;
  }

  getSpecialData(playerName, card) {
    let currPlayer = this.players.find(p => p.name === playerName);

    switch (card.name) {
      case 'Chopsticks':
        // display the current player's hand
        return currPlayer.hand;
      case 'Menu':
        // display top 4 cards on the deck
        return this.deck.activeDeck.slice(0, 4);
      case 'Special Order':
        // display current player's played cards
        return currPlayer.playedCards;
      case 'Spoon':
        // display the menu
        let valArray = Object.values(this.deck.menu);
        let menuItems = ['Nigiri'];
        menuItems.push(valArray[0]);
        menuItems = menuItems.concat(valArray[1]);
        menuItems = menuItems.concat(valArray[2]);
        menuItems.push(valArray[3]);
        return menuItems;
      case 'Takeout Box':
        // display current player's played cards
        return currPlayer.playedCards;
      default:
        return [];
    }
  }

  handleSpecialAction(player, specialCard, chosenCard) {
    let specialCardCasted = new Card(specialCard);
    if (!chosenCard) {
      _.remove(player.turnCards, c => _.isEqual(c, specialCardCasted));
      return;
    }

    let indexOfSpe = _.findIndex(player.turnCardsReuse, c =>
      _.isEqual(c, specialCardCasted)
    );

    if (indexOfSpe === -1) {
      indexOfSpe = _.findIndex(player.turnCards, c =>
        _.isEqual(c, specialCardCasted)
      );
    }

    switch (specialCard.name) {
      case 'Chopsticks':
        // add card to player's turn cards from their hand
        player.playCardFromHand(chosenCard);

        player.hand.push(player.turnCardsReuse.splice(indexOfSpe, 1)[0]);
        break;
      case 'Menu':
        // choose a card from the top 4 in the unused deck, shuffle the rest
        let cardFromDeck = this.deck.removeOneAndShuffle(chosenCard);

        //remove special card from turn cards and add the one from the deck
        player.turnCards.splice(indexOfSpe, 1, cardFromDeck);
        break;
      case 'Special Order':
        // add the card to the player's turn cards
        let duplicate = new Card(chosenCard);

        //remove special card from turn cards (the chosen card is duplicated and replaces it)
        player.turnCards.splice(indexOfSpe, 1, duplicate);
        break;
      case 'Spoon':
        // find the first person on the left (at the back of the players array) who has chosenCard in their hand
        // swap it with the spoon
        let indexCurrPlayer = this.players.findIndex(
          p => p.socketId === player.socketId
        );

        // the player to the left of another is the one before it in the array
        const nextLeftPlayerIndex = idx =>
          (idx - 1 + this.numPlayers) % this.numPlayers;

        // visit each player in clockwise order to see if they have the desired card in their hand
        let i = nextLeftPlayerIndex(indexCurrPlayer);
        for (i; i !== indexCurrPlayer; i = nextLeftPlayerIndex(i)) {
          let p = this.players[i];

          //note for the spoon case, chosenCard is a string containing the name, not a Card object
          let cardInHand = p.hand.findIndex(c => c.name === chosenCard);
          if (cardInHand !== -1) {
            player.playedCards.push(p.hand[cardInHand]);
            p.hand[cardInHand] = specialCardCasted;
            break;
          }
        }

        player.turnCardsReuse.splice(indexOfSpe, 1);
        break;
      case 'Takeout Box':
        // replace chosen card with takeout box
        let chosenCardCast = new Card(chosenCard);
        let card = _.find(player.playedCards, c =>
          _.isEqual(c, chosenCardCast)
        );
        card.name = CardNameEnum.TAKEOUT_BOX;

        player.playedCards.push(player.turnCards.splice(indexOfSpe, 1)[0]);
        break;
      default:
    }
  }

  resetGame() {
    this.players.forEach(p => {
      p.playedCards = [];
      p.dessertCards = [];
    });
  }

  startRound() {
    this.setupDeck();

    const hands = [];
    for (let i = 0; i < this.numPlayers; i++) {
      const temp = this.deck.dealHand(handSize[this.numPlayers]);
      hands.push(temp);
    }
    this.rotateHands(hands);
  }

  handleEndGame(sendPlayerData, sendGameResults) {
    calculateGamePoints(this.players, this.deck.menu);
    let tempPlayers = this.getPlayersData();
    this.players.forEach(p => {
      sendPlayerData(p.socketId, p.hand, tempPlayers);
      tempPlayers.push(tempPlayers.shift());
    });

    // sort from highest to lowest
    tempPlayers.sort((p1, p2) => p2.points - p1.points);

    // end game + display results
    this.players.forEach(p => {
      sendGameResults(
        p.socketId,
        tempPlayers,
        p.socketId === this.hostPlayer.socketId
      );
    });
    console.log('End of game');
  }

  setupDeck() {
    const dessertsMap =
      this.numPlayers > 6 ? numDesserts.more : numDesserts.less;
    this.deck.resetDeck(dessertsMap[this.round]);
    this.deck.shuffle();

    if (this.deck.menu.roll === CardNameEnum.URAMAKI) {
      this.players.forEach(p => (this.uramakiCountMap[p.name] = 0));
    }
  }

  getPlayerHands() {
    return this.players.map(p => p.hand);
  }

  // rotate player hands - "pass hand to player on your left"
  rotateHands(hands) {
    const firstHand = hands.shift();
    hands.push(firstHand);
    this.players.forEach((p, idx) => (p.hand = hands[idx]));
  }

  sumCardData(name, player) {
    return player.playedCards.reduce(
      (accum, curr) => (accum += curr.name === name ? curr.data : 0)
    );
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
