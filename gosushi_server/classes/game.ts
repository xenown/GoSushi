import { cloneDeepWith, findIndex, isEqual, omit, remove } from 'lodash';
import Card from './card';
import Deck from './deck';
import Player from './player';
import CardNameEnum from '../types/cardNameEnum';
import IMenu from '../types/IMenu';
import ISpecialAction from '../types/ISpecialAction';
import { IUramakiCountMap, IUramakiStanding } from '../types/IUramaki';
import {
  specialActionsHand,
  specialActionsPlayed,
} from '../util/cardCategories';
import {
  calculateTurnPoints,
  calculateRoundPoints,
  calculateGamePoints,
} from '../util/calculatePoints';
import handSize from '../util/handSize';

const dev = process.env.SHORT;

interface ISpecialLogEntry {
  chosenCard: string;
  stolenFromPlayer: string;
  player: string;
  playedCard: string;
  boxCards: number;
}

type TSendGameResult = (socketId: string, playerData: Player[], isHost: boolean) => void
type TSendLogEntry = (roomCode: string, specialLogEntry: ISpecialLogEntry) => void
type TSendPlayerData = (socketId: string, hand: Card[], tempPlayers: Player[]) => void
type TSendSpecialAction = (playerName: string, players: Player[], card: Card, data: Card[] | string[]) => void
type TUpdateRound = (roomCode: string, round: number) => void

interface INumDesserts {
  less: {
    [key: number]: number
  },
  more: {
    [key: number]: number
  }
}

const numDesserts: INumDesserts = {
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

class Game {
  deck: Deck;
  numPlayers: number;
  roomCode: string;
  hostPlayer: Player;
  players: Player[];
  round: number = 1;
  hands: Card[][] = [];
  playedTurn: number = 0;
  uramakiCountMap: IUramakiCountMap = {};
  uramakiStanding: IUramakiStanding = { value: 1 };
  specialActions: ISpecialAction[] = [];
  gameStarted: boolean = false;
  isGameOver: boolean = false;

  constructor(
    menu: IMenu,
    playerNum: number,
    roomCode: string,
    hostPlayerName: string,
    hostIp: string,
    socketId: string,
  ) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.hostPlayer = new Player(hostPlayerName, hostIp, socketId);
    this.players = [this.hostPlayer];
  } // constructor

  // start a new game, reset values
  newGame(menu: IMenu, playerNum: number, hostPlayerName: string) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.hostPlayer.name = hostPlayerName;

    // Reset remaining parameters
    this.round = 1;
    this.hands = [];
    this.playedTurn = 0;
    this.uramakiCountMap = {};
    this.uramakiStanding.value = 1;
    this.specialActions = [];
    this.gameStarted = false;
    this.isGameOver = false;

    // reset all players
    this.players.forEach(p => {
      p.resetPlayer();
    });
  } // newGame

  // add a player to the game
  addPlayer(name: string, socketId: string, ip: string, isAuto = false) {
    this.players.push(new Player(name, ip, socketId, isAuto));
  } // addPlayer

  checkForSpecialActions() {
    const isInSpecialActions = (newCard: Card, newPlayerName: string) =>
      this.specialActions.findIndex(
        (obj: ISpecialAction) =>
          isEqual(obj.card, newCard) && obj.playerName === newPlayerName
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
  } // checkForSpecialActions

  // handle when a player finishes their turn
  finishedTurn(
    sendPlayerData: TSendPlayerData,
    notifySpecialAction: TSendSpecialAction,
    sendGameResults: TSendGameResult,
    updateRound: TUpdateRound,
    sendLogEntry: TSendLogEntry,
  ) {
    this.playedTurn++; // increment number of players that have finished their turn
    console.log(this.playedTurn);
    const numRealPlayers = this.players.reduce(
      (acc, p) => (p.isAuto ? acc : acc + 1),
      0
    );

    // check if all real players have finished, otherwise do nothing
    if (this.playedTurn === numRealPlayers) {
      this.players.forEach(p => {
        // if auto playing and the auto players haven't done an initial action yet, play cards
        if (p.isAuto && !p.hasAutoPlayedCard) {
          p.hasAutoPlayedCard = true;
        }
        // Remove everyone's chosen cards from their hand
        p.turnCards.forEach(card => {
          p.removeCardFromHand(card);
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
      } // if
    } // if
  } // finishedTurn

  handleFinishedTurnActions(sendPlayerData: TSendPlayerData, sendGameResults: TSendGameResult, updateRound: TUpdateRound) {
    calculateTurnPoints(
      this.players,
      this.deck.menu,
      this.uramakiCountMap,
      this.uramakiStanding
    );
    let tempPlayers: Player[] = [];
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
          tempPlayers.push(tempPlayers.shift()!);
        });
      } else {
        this.handleEndGame(sendPlayerData, sendGameResults);
      }
    } else {
      tempPlayers = this.getPlayersData();
      this.players.forEach(p => {
        sendPlayerData(p.socketId, p.hand, tempPlayers);
        tempPlayers.push(tempPlayers.shift()!);
      });
    }
  }

  // get the data that needs to be sent to the front-end, only clone necessary information
  getPlayersData() {
    let tempPlayers: Player[] = [];
    const notCloned = ['hand', 'makiCount', 'uramakiCount'];
    this.players.forEach(p => {
      const data = cloneDeepWith(omit(p, notCloned));
      data.isFinished = p.turnCards.length !== 0;
      tempPlayers.push(data);
    });
    return tempPlayers;
  }

  getSpecialData(playerName: string, card: Card): Card[] | string[] {
    let currPlayer: Player = this.players.find(p => p.name === playerName)!;

    switch (card.name) {
      case 'Chopsticks':
        // display the current player's hand
        return currPlayer.hand; // Card[]
      case 'Menu':
        // display top 4 cards on the deck
        return this.deck.activeDeck.slice(0, 4); // Card[]
      case 'Special Order':
        // display current player's played cards
        return currPlayer.playedCards; // Card[]
      case 'Spoon':
        // display the menu
        let valArray: string[] = Object.values(this.deck.menu);
        let menuItems = ['Nigiri']; // add the Nigiri
        menuItems.push(valArray[0]); // add the roll card from the menu
        menuItems = menuItems.concat(valArray[1]); // add the appetizer cards from the menu
        menuItems = menuItems.concat(valArray[2]); // add the special cards from the menu
        menuItems.push(valArray[3]); // add the dessert card from the menu
        return menuItems; // string[]
      case 'Takeout Box':
        // display current player's played cards
        return currPlayer.playedCards; // Card[]
      default:
        return [];
    } // switch
  } // getSpecialData

  handleSpecialAction(
    player: Player,
    specialCard: Card,
    chosenCards: Card[] | string[],
    sendLogEntry: TSendLogEntry,
  ) {
    let specialLogEntry: ISpecialLogEntry = {
      chosenCard: '',
      stolenFromPlayer: '',
      player: player.name,
      playedCard: specialCard.name,
      boxCards: 0,
    };

    let specialCardCasted = new Card(specialCard);
    player.removePlayedCard(specialCardCasted);
    if (chosenCards.length === 0) {
      remove(player.turnCards, (c: Card) => isEqual(c, specialCardCasted));
      return;
    }

    let indexOfSpe = findIndex(player.turnCardsReuse, (c: Card) =>
      isEqual(c, specialCardCasted)
    );

    if (indexOfSpe === -1) {
      indexOfSpe = findIndex(player.turnCards, (c: Card) =>
        isEqual(c, specialCardCasted)
      );
    }

    switch (specialCard.name) {
      case 'Chopsticks':
        chosenCards = chosenCards as Card[];
        // add card to player's turn cards from their hand
        player.playCardFromHand(chosenCards[0]);
        player.hand.push(player.turnCardsReuse.splice(indexOfSpe, 1)[0]);

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0].name;
        break;
      case 'Menu':
        chosenCards = chosenCards as Card[];
        // choose a card from the top 4 in the unused deck, shuffle the rest
        let cardFromDeck = this.deck.removeOneAndShuffle(chosenCards[0]);

        //remove special card from turn cards and add the one from the deck
        player.turnCards.splice(indexOfSpe, 1, cardFromDeck);

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0].name;
        break;
      case 'Special Order':
        chosenCards = chosenCards as Card[];
        // add the card to the player's turn cards
        let duplicate = new Card(chosenCards[0]);

        //remove special card from turn cards (the chosen card is duplicated and replaces it)
        player.turnCards.splice(indexOfSpe, 1, duplicate);

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0].name;
        break;
      case 'Spoon':
        chosenCards = chosenCards as string[];
        // find the first person on the left (at the back of the players array) who has chosenCard in their hand
        // swap it with the spoon
        let indexCurrPlayer = this.players.findIndex(
          p => p.socketId === player.socketId
        );

        // update played special card log
        specialLogEntry.chosenCard = chosenCards[0];

        // the player to the left of another is the one before it in the array (at a smaller)
        const nextLeftPlayerIndex = (idx: number) =>
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
        chosenCards = chosenCards as Card[];
        // replace chosen card with takeout box
        let indexChosen = 0;
        for (let c in player.playedCards) {
          if (
            isEqual(player.playedCards[c], new Card(chosenCards[indexChosen]))
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
  } // handleSpecialAction

  startRound() {
    this.setupDeck();

    const hands = [];
    for (let i = 0; i < this.numPlayers; i++) {
      const temp = this.deck.dealHand(handSize[this.numPlayers]);
      hands.push(temp);
    }
    this.rotateHands(hands);
  } // startRound

  handleEndGame(sendPlayerData: TSendPlayerData, sendGameResults: TSendGameResult) {
    this.isGameOver = true;
    calculateGamePoints(this.players, this.deck.menu);
    let tempPlayers = this.getPlayersData();
    this.players.forEach(p => {
      sendPlayerData(p.socketId, p.hand, tempPlayers);
      tempPlayers.push(tempPlayers.shift()!);
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
  } // handleEndGame

  setupDeck() {
    const dessertsMap =
      this.numPlayers > 6 ? numDesserts.more : numDesserts.less;
    this.deck.resetDeck(dessertsMap[this.round]);
    this.deck.shuffle();

    if (this.deck.menu.roll === CardNameEnum.URAMAKI) {
      this.players.forEach(p => (this.uramakiCountMap[p.name] = 0));
    }
  } // setupDeck

  // rotate player hands - "pass hand to player on your left"
  rotateHands(hands: Card[][]) {
    const firstHand = hands.shift()!;
    hands.push(firstHand);
    this.players.forEach((p, idx) => (p.hand = hands[idx]));
  } // rotateHands
} // Game

export default Game;
