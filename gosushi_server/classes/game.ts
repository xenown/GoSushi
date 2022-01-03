import { findIndex, isEqual, remove } from 'lodash';
import Card from './card';
import Deck from './deck';
import { IConnection } from './myConnection';
import Player from './player';
import { AppetizersEnum, MenuCardNameEnum, RollsEnum } from '../types/cardNameEnum';
import IMenu from '../types/IMenu';
import IPlayer from '../types/IPlayer'
import ISpecialAction, { ISpecialLogEntry, TSpecialData } from '../types/ISpecialAction';
import { ICountMap, IMoreLessPoints, IUramakiStanding } from '../types/IPoints';
import {
  specialActionsHand,
  specialActionsPlayed,
} from '../util/specialActions';
import {
  calculateTurnPoints,
  calculateRoundPoints,
  calculateGamePoints,
  createEmptyResultMap,
} from '../util/calculatePoints';
import handSize from '../util/handSize';
import IPointsResult from '../types/IPointsResult';

const dev = process.env.SHORT;

const numDesserts: IMoreLessPoints = {
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
  uramakiCountMap: ICountMap = {};
  uramakiStanding: IUramakiStanding = { value: 1 };
  resultMap: IPointsResult = {};
  specialActions: ISpecialAction[] = [];
  gameStarted: boolean = false;
  isGameOver: boolean = false;

  connection: IConnection;

  constructor(
    menu: IMenu,
    playerNum: number,
    roomCode: string,
    hostPlayerName: string,
    hostIp: string,
    socketId: string,
    conn: IConnection,
  ) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.hostPlayer = new Player(hostPlayerName, hostIp, socketId);
    this.players = [this.hostPlayer];

    this.connection = conn;
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

  startGame() {
    this.startRound();
    this.gameStarted = true;
  } // startGame

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
  finishedTurn() {
    this.playedTurn++; // increment number of players that have finished their turn
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
          p.playCardFromHand(p.hand[0]);
        }
        // Remove everyone's chosen cards from their hand
        p.turnCards.forEach(card => {
          p.removeCardFromHand(card);
        });
      });

      this.checkForSpecialActions();
      if (this.specialActions.length > 0) {
        this.playedTurn -= 1;

        // pop first element from specialActions to process
        let { card, playerName } = this.specialActions.shift()!;
        console.log(`player ${playerName} plays special card: ${card.name}`);

        let index = this.players.findIndex(p => p.name === playerName);
        let data = this.getSpecialData(playerName, card);

        if (this.players[index].isAuto) {
          this.handleSpecialAction(
            this.players[index],
            card,
            data.slice(0, 1),
          );
          this.finishedTurn();
        } else {
          this.connection.doSpecialAction(
            playerName,
            this.players,
            card,
            this.getSpecialData(playerName, card),
          );
        }
        // TODO: notify others to wait for 'playerName' player to finish 'card.name' action
      } else {
        this.playedTurn = 0;
        this.players.forEach(p => (p.hasAutoPlayedCard = false));
        this.handleFinishedTurnActions();
      } // if
    } // if
  } // finishedTurn

  handleFinishedTurnActions() {
    calculateTurnPoints(
      this.players,
      this.resultMap,
      this.deck.menu,
      this.uramakiCountMap,
      this.uramakiStanding,
    );
    let tempPlayers: IPlayer[] = [];
    this.rotateHands(this.players.map(p => p.hand));

    if (this.players[0].hand.length === 0) {
      // no more cards in the hand
      calculateRoundPoints(this.players, this.resultMap, this.deck.menu);

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
        this.connection.updateRound(this.roomCode, this.round);
        console.log('End of round');

        // reset uramaki standing
        this.uramakiStanding.value = 1;

        // remove and add desserts
        this.startRound();
        tempPlayers = this.getPlayersData();
        this.players.forEach(p => {
          this.connection.sendTurnData(p.socketId, p.hand, tempPlayers);
          tempPlayers.push(tempPlayers.shift()!);
        });
      } else {
        this.handleEndGame();
      }
    } else {
      // continue round
      tempPlayers = this.getPlayersData();
      this.players.forEach(p => {
        this.connection.sendTurnData(p.socketId, p.hand, tempPlayers);
        tempPlayers.push(tempPlayers.shift()!);
      });
    }
  }

  // get the data that needs to be sent to the front-end, only clone necessary information
  getPlayersData() {
    let tempPlayers: IPlayer[] = [];
    this.players.forEach(p => {
      const { hand, makiCount, uramakiCount, ...rest } = p;
      const data: IPlayer = {
        ...rest,
        isFinished: p.turnCards.length !== 0,
      };
      tempPlayers.push(data);
    });
    return tempPlayers;
  }

  getSpecialData(playerName: string, card: Card): TSpecialData[] {
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
        let menuItems: MenuCardNameEnum[] = ['Nigiri']; // add the Nigiri
        menuItems.push(this.deck.menu.roll); // add the roll card from the menu
        menuItems = menuItems.concat(this.deck.menu.appetizers); // add the appetizer cards from the menu
        menuItems = menuItems.concat(this.deck.menu.specials); // add the special cards from the menu
        menuItems.push(this.deck.menu.dessert); // add the dessert card from the menu
        return menuItems;
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
    specialData: TSpecialData[],
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
    if (specialData.length === 0) {
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

    const selectedCards = specialData as Card[];
    const selectedMenuCards = specialData as MenuCardNameEnum[];
    switch (specialCard.name) {
      case 'Chopsticks':
        // add card to player's turn cards from their hand
        player.playCardFromHand(selectedCards[0]);
        player.hand.push(player.turnCardsReuse.splice(indexOfSpe, 1)[0]);

        // update played special card log
        specialLogEntry.chosenCard = selectedCards[0].name;
        break;
      case 'Menu':
        // choose a card from the top 4 in the unused deck, shuffle the rest
        let cardFromDeck = this.deck.removeOneAndShuffle(selectedCards[0]);

        //remove special card from turn cards and add the one from the deck
        player.turnCards.splice(indexOfSpe, 1, cardFromDeck);

        // update played special card log
        specialLogEntry.chosenCard = selectedCards[0].name;
        break;
      case 'Special Order':
        // add the card to the player's turn cards
        let duplicate = new Card(selectedCards[0]);

        //remove special card from turn cards (the chosen card is duplicated and replaces it)
        player.turnCards.splice(indexOfSpe, 1, duplicate);

        // update played special card log
        specialLogEntry.chosenCard = selectedCards[0].name;
        break;
      case 'Spoon':
        // find the first person on the left (at the back of the players array) who has chosenCard in their hand
        // swap it with the spoon
        let indexCurrPlayer = this.players.findIndex(
          p => p.socketId === player.socketId
        );

        // update played special card log
        specialLogEntry.chosenCard = selectedMenuCards[0];

        // the player to the left of another is the one before it in the array (at a smaller)
        const nextLeftPlayerIndex = (idx: number) =>
          (idx - 1 + this.numPlayers) % this.numPlayers;

        // visit each player in clockwise order to see if they have the desired card in their hand
        let i = nextLeftPlayerIndex(indexCurrPlayer);
        for (i; i !== indexCurrPlayer; i = nextLeftPlayerIndex(i)) {
          let p = this.players[i];

          //note for the spoon case, chosenCard is a string containing the name, not a Card object
          let cardInHand = p.hand.findIndex(c => c.name === selectedMenuCards[0]);
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
            isEqual(player.playedCards[c], new Card(selectedCards[indexChosen]))
          ) {
            player.playedCards[c] = specialCardCasted;
            indexChosen++;
          }
        }
        player.turnCards.splice(indexOfSpe, 1);
        specialLogEntry.boxCards = selectedCards.length;
        break;
      default:
    }
    this.connection.sendLogEntry(this.roomCode, specialLogEntry);
  } // handleSpecialAction

  startRound() {
    this.setupDeck();
    // create default empty result for the given menu
    this.resultMap = createEmptyResultMap(this.players, this.deck.menu);

    const hands = [];
    for (let i = 0; i < this.numPlayers; i++) {
      const temp = this.deck.dealHand(handSize[this.numPlayers]);
      hands.push(temp);
    }
    this.rotateHands(hands);
  } // startRound

  handleEndGame() {
    this.isGameOver = true;
    calculateGamePoints(this.players, this.resultMap, this.deck.menu);
    let tempPlayers = this.getPlayersData();
    this.players.forEach(p => {
      this.connection.sendTurnData(p.socketId, p.hand, tempPlayers);
      tempPlayers.push(tempPlayers.shift()!);
    });

    // sort from highest to lowest
    tempPlayers.sort((p1, p2) => p2.points - p1.points);

    // end game + display results
    this.players.forEach(p => {
      this.connection.sendGameResults(
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

    if (this.deck.menu.roll === RollsEnum.URAMAKI) {
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
