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
const dev = process.env.SHORT;

class Game {
  constructor(menu, playerNum, roomCode, hostPlayer, hostIp, socketId) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.hostPlayer = new Player(hostPlayer, hostIp, socketId);
    this.players = [this.hostPlayer];
    this.round = 1;
    this.hands = [];
    this.playedTurn = 0;
    this.uramakiCountMap = {};
    this.uramakiStanding = { value: 1 };
    this.specialActions = [];
    this.gameStarted = false;
    this.isGameOver = false;
  }

  newGame(menu, playerNum, hostPlayer) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.hostPlayer.name = hostPlayer;
    // Reset remaining parameters
    this.round = 1;
    this.hands = [];
    this.playedTurn = 0;
    this.uramakiCountMap = {};
    this.uramakiStanding.value = 1;
    this.specialActions = [];
    this.gameStarted = false;
    this.isGameOver = false;

    this.players.forEach(p => {
      p.resetPlayer();
    });
  }

  addPlayer(name, socketId, ip, isAuto = false) {
    this.players.push(new Player(name, ip, socketId, isAuto));
  }

  checkForSpecialActions() {
    const isInSpecialActions = (newCard, newPlayerName) =>
      this.specialActions.findIndex(
        obj => _.isEqual(obj.card, newCard) && obj.playerName === newPlayerName
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

  finishedTurn(
    sendPlayerData,
    notifySpecialAction,
    sendGameResults,
    updateRound,
    sendLogEntry
  ) {
    this.playedTurn++;
    const numRealPlayers = this.players.reduce(
      (acc, p) => (p.isAuto ? acc : acc + 1),
      0
    );
    if (this.playedTurn === numRealPlayers) {
      this.players.forEach(p => {
        // if auto playing, if the auto players haven't done an initial action yet, play cards
        if (p.isAuto && !p.hasAutoPlayedCard) {
          p.hasAutoPlayedCard = true;
        }
        // Remove everyone's chosen cards from their hand
        p.turnCards.forEach(card => {
          p.removeCardfromHand(card);
        });
      });

      this.checkForSpecialActions();
      if (this.specialActions.length > 0) {
        this.playedTurn -= 1;

        let { card, playerName } = this.specialActions[0];

        // console.log(`player ${playerName} plays special card: ${card.name}`);

        let index = this.players.findIndex(p => p.name === playerName);
        let data = this.getSpecialData(playerName, card);

        if (this.players[index].isAuto) {
          this.handleSpecialAction(
            this.players[index],
            card,
            data.slice(0, 1),
            sendLogEntry
          );
          this.finishedTurn(
            sendPlayerData,
            notifySpecialAction,
            sendGameResults,
            updateRound,
            sendLogEntry
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
        this.players.forEach(p => (p.hasAutoPlayedCard = false));
        this.handleFinishedTurnActions(
          sendPlayerData,
          sendGameResults,
          updateRound
        );
      }
    }
  }

  handleFinishedTurnActions(sendPlayerData, sendGameResults, updateRound) {
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
      const maxRound = dev ? 1 : 3;
      if (this.round < maxRound) {
        // go to next round
        this.round++;
        updateRound(this.roomCode, this.round);
        console.log('End of round');

        // reset uramaki standing
        this.uramakiStanding.value = 1;

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
    const notCloned = ['hand', 'makiCount', 'uramakiCount'];
    this.players.forEach(p => {
      const data = _.cloneDeepWith(_.omit(p, notCloned));
      data.isFinished = p.turnCards.length !== 0;
      tempPlayers.push(data);
    });
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

  handleSpecialAction(player, specialCard, chosenCards, sendLogEntry) {
    let specialLogEntry = {
      player: player.name,
      playedCard: specialCard.name,
    };

    let specialCardCasted = new Card(specialCard);
    player.removePlayedCard(specialCardCasted);
    if (chosenCards.length === 0) {
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
        player.playCardFromHand(chosenCards[0]);
        player.hand.push(player.turnCardsReuse.splice(indexOfSpe, 1)[0]);

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0].name;
        break;
      case 'Menu':
        // choose a card from the top 4 in the unused deck, shuffle the rest
        let cardFromDeck = this.deck.removeOneAndShuffle(chosenCards[0]);

        //remove special card from turn cards and add the one from the deck
        player.turnCards.splice(indexOfSpe, 1, cardFromDeck);

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0].name;
        break;
      case 'Special Order':
        // add the card to the player's turn cards
        let duplicate = new Card(chosenCards[0]);

        //remove special card from turn cards (the chosen card is duplicated and replaces it)
        player.turnCards.splice(indexOfSpe, 1, duplicate);

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0].name;
        break;
      case 'Spoon':
        // find the first person on the left (at the back of the players array) who has chosenCard in their hand
        // swap it with the spoon
        let indexCurrPlayer = this.players.findIndex(
          p => p.socketId === player.socketId
        );

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0];

        // the player to the left of another is the one before it in the array (at a smaller)
        const nextLeftPlayerIndex = idx =>
          (idx - 1 + this.numPlayers) % this.numPlayers;

        // visit each player in clockwise order to see if they have the desired card in their hand
        let i = nextLeftPlayerIndex(indexCurrPlayer);
        for (i; i !== indexCurrPlayer; i = nextLeftPlayerIndex(i)) {
          let p = this.players[i];

          //note for the spoon case, chosenCard is a string containing the name, not a Card object
          let cardInHand = p.hand.findIndex(c => c.name === chosenCards[0]);
          if (cardInHand !== -1) {
            player.playedCards.push(p.hand[cardInHand]);
            p.hand[cardInHand] = specialCardCasted;
            specialLogEntry.stolenFromPlayer = p.name;
            break;
          }
        }

        player.turnCardsReuse.splice(indexOfSpe, 1);
        break;
      case 'Takeout Box':
        // replace chosen card with takeout box
        let indexChosen = 0;
        for (let c in player.playedCards) {
          if (
            _.isEqual(player.playedCards[c], new Card(chosenCards[indexChosen]))
          ) {
            player.playedCards[c] = specialCardCasted;
            indexChosen++;
          }
        }
        player.turnCards.splice(indexOfSpe, 1);
        specialLogEntry.boxCards = chosenCards.length;
        break;
      default:
    }
    sendLogEntry(this.roomCode, specialLogEntry);
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
    this.isGameOver = true;
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

    // keep only the host
    this.players = [];
    delete this.deck;
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

  // rotate player hands - "pass hand to player on your left"
  rotateHands(hands) {
    const firstHand = hands.shift();
    hands.push(firstHand);
    this.players.forEach((p, idx) => (p.hand = hands[idx]));
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
