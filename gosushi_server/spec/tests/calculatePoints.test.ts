import { clone, isArray, last } from 'lodash';
import Card from '../../classes/card';
import Game from '../../classes/game';
import { MockConnection } from '../../classes/myConnection';
import Player from '../../classes/player';
import {
  calculateGamePoints,
  calculateRoundPoints,
  calculateTurnPoints,
} from '../../util/calculatePoints';
import { NigiriEnum, RollsEnum, AppetizersEnum, SpecialsEnum, DessertsEnum }  from '../../types/cardNameEnum';
import OnigiriNameEnum from '../../types/onigiriNameEnum';
import menus from '../../util/suggestedMenus';

// Add an array of players to a game
const addPlayers = (game: Game, players: string[]) => {
  for (let i = 1; i < players.length; i++) {
    game.addPlayer(players[i], players[i], 'ip');
  }
};

describe('calculateTurnPoints', function () {
  const roomCode = 'code';
  const players = ['P1', 'P2', 'P3'];
  const hands = [
    [
      new Card(AppetizersEnum.MISO_SOUP),
      new Card(RollsEnum.URAMAKI, 0, 5),
      new Card(RollsEnum.URAMAKI, 1, 4),
      new Card(RollsEnum.URAMAKI, 2, 3),
      new Card(RollsEnum.URAMAKI, 3, 10),
      new Card(AppetizersEnum.TOFU),
      new Card(SpecialsEnum.WASABI),
      new Card(SpecialsEnum.WASABI),
      [new Card(NigiriEnum.EGG), new Card(NigiriEnum.SALMON)],
      new Card(AppetizersEnum.TOFU),
    ],
    [
      new Card(AppetizersEnum.MISO_SOUP),
      new Card(RollsEnum.URAMAKI, 0, 5),
      new Card(RollsEnum.URAMAKI, 1, 4),
      new Card(RollsEnum.URAMAKI, 2, 3),
      new Card(RollsEnum.URAMAKI, 3, 10),
      new Card(AppetizersEnum.TOFU),
      new Card(SpecialsEnum.WASABI),
      new Card(SpecialsEnum.WASABI),
      new Card(NigiriEnum.SALMON),
      new Card(NigiriEnum.SQUID),
    ],
    [
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.MISO_SOUP),
      new Card(RollsEnum.URAMAKI, 0, 4),
      new Card(RollsEnum.URAMAKI, 1, 3),
      new Card(RollsEnum.URAMAKI, 2, 3),
      new Card(RollsEnum.URAMAKI, 3, 10),
      new Card(SpecialsEnum.WASABI),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.TOFU),
      new Card(NigiriEnum.SALMON),
    ],
  ];

  const game = new Game(
    clone(menus.dinnerForTwo),
    players.length,
    roomCode,
    players[0],
    'hostIp',
    'socketId',
    new MockConnection(),
  );

  addPlayers(game, players);
  game.setupDeck();
  // Assign hands to each player
  game.players.forEach((p: Player, index: number) => {
    // Each hand is in reverse order so we can pop off the last one when playing a card
    p.hand = hands[index].reverse() as Card[];
  });

  beforeEach(() => {
    // Pop last card and add it to turnCards to "play" it
    game.players.forEach((p: Player) => p.turnCards.push(p.hand.pop()!));
    calculateTurnPoints(
      game.players,
      game.deck.menu,
      game.uramakiCountMap,
      game.uramakiStanding
    );
  });

  it('should not give Miso points when 2 are played', () => {
    const misos = game.players.map((p: Player) => last(p.playedCards)!);
    expect(misos.map((el: Card) => el.data)).toEqual([0, 0, null]);
    const temp = game.players.map((p: Player) => last(p.hand)!);
  });

  it('should give Miso 3 points when 1 is played', () => {
    const misos = game.players.map((p: Player) => last(p.playedCards)!);
    expect(misos.map((el: Card) => el.data)).toEqual([5, 5, 3]);
  });

  it('should not give points when no Uramaki race is won', () => {
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 0, 0]);
  });

  it('should give 8 points to tied 1st place winners', () => {
    expect(game.players.map((p: Player) => p.points)).toEqual([8, 8, 0]);
  });

  it('should give 2 points to tied 3rd place winners', () => {
    expect(game.players.map((p: Player) => p.points)).toEqual([10, 10, 2]);
  });

  it('should give no points when all prizes are taken', () => {
    expect(game.players.map((p: Player) => p.points)).toEqual([10, 10, 2]);
  });

  it("should assign two Wasabi's in a turn to one player (P1) and assign one Wasabi to another (P2)", () => {
    game.deck.menu.specials = [SpecialsEnum.WASABI];
    game.players.forEach((p: Player) => p.turnCards.push(p.hand.pop()!));
    calculateTurnPoints(
      game.players,
      game.deck.menu,
      game.uramakiCountMap,
      game.uramakiStanding
    );

    game.players.forEach((p: Player) => {
      let card = p.hand.pop()!;
      if (isArray(card)) {
        p.turnCards = p.turnCards.concat(card);
      } else {
        p.turnCards.push(card);
      }
    });

    calculateTurnPoints(
      game.players,
      game.deck.menu,
      game.uramakiCountMap,
      game.uramakiStanding
    );

    const wasabi1 = game.players[0].playedCards.filter(
      (c: Card) => c.name === SpecialsEnum.WASABI
    );
    expect(wasabi1.map(el => el.data)).toEqual([4, 2]);

    const wasabi2 = game.players[1].playedCards.filter(
      (c: Card) => c.name === SpecialsEnum.WASABI
    );
    expect(wasabi2.map((el: Card) => el.data)).toEqual([4, null]);
  });

  it("should assign two Wasabi's in one turn to different players (P2 and P3)", () => {
    const wasabi2 = game.players[1].playedCards.filter(
      (c: Card) => c.name === SpecialsEnum.WASABI
    );
    expect(wasabi2.map((el: Card) => el.data)).toEqual([4, 6]);

    const wasabi3 = game.players[2].playedCards.filter(
      (c: Card) => c.name === SpecialsEnum.WASABI
    );
    expect(wasabi3.map((el: Card) => el.data)).toEqual([4]);
  });
});

describe('calculateRollPoints', function () {
  const roomCode = 'code';
  const players = [
    ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    ['P1', 'P2'],
    ['P1', 'P2', 'P3'],
  ];

  const hands = [
    [
      [
        new Card(RollsEnum.MAKI, 0, 10),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
      ],
      [
        new Card(RollsEnum.MAKI, 0, 10),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
      ],
      [
        new Card(RollsEnum.MAKI, 0, 6),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
      ],
      [
        new Card(RollsEnum.MAKI, 0, 3),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
      ],
      [new Card(RollsEnum.TEMAKI), new Card(RollsEnum.TEMAKI)],
      [new Card(RollsEnum.TEMAKI), new Card(RollsEnum.TEMAKI)],
    ],
    [
      [new Card(RollsEnum.MAKI, 0, 10), new Card(RollsEnum.TEMAKI)],
      [
        new Card(RollsEnum.MAKI, 0, 5),
        new Card(RollsEnum.MAKI, 1, 3),
        new Card(RollsEnum.TEMAKI),
        new Card(RollsEnum.TEMAKI),
      ],
    ],
    [[], [], [new Card(RollsEnum.MAKI, 0, 3)]],
  ];

  const uramakis = [
    new Card(RollsEnum.URAMAKI, 0, 5),
    new Card(RollsEnum.URAMAKI, 1, 4),
    new Card(RollsEnum.URAMAKI, 2, 5),
    new Card(RollsEnum.URAMAKI, 3, 3),
    new Card(RollsEnum.URAMAKI, 4, 1),
    new Card(RollsEnum.URAMAKI, 5, 1),
  ];

  // Set up game with different roll depending on test case number (num)
  const setupGame = (num: number) => {
    const game = new Game(
      clone(menus.firstMeal),
      players[num].length,
      roomCode,
      players[num][0],
      'hostId',
      'socketId',
      new MockConnection(),
    );

    addPlayers(game, players[num]);

    game.deck.menu.roll = num === 0 ? RollsEnum.URAMAKI : RollsEnum.MAKI;
    game.setupDeck();
    game.players.forEach((p: Player, index: number) => {
      p.playedCards = hands[num][index];
      if (num === 0) p.turnCards.push(uramakis[index]);
    });

    return game;
  };

  const games = [setupGame(0), setupGame(1), setupGame(2)];

  it('should give Uramaki points correctly at the end of last turn', () => {
    calculateTurnPoints(
      games[0].players,
      games[0].deck.menu,
      games[0].uramakiCountMap,
      games[0].uramakiStanding
    );
    expect(games[0].players.map((p: Player) => p.points)).toEqual([8, 2, 8, 0, 0, 0]);
  });

  it('should give Maki points correctly for over 5 players', () => {
    games[0].deck.menu.roll = RollsEnum.MAKI;
    calculateRoundPoints(games[0].players, games[0].deck.menu);
    expect(games[0].players.map((p: Player) => p.points)).toEqual([12, 6, 10, 0, 0, 0]);
  });

  it('should give Temaki points correctly for over 5 players', () => {
    games[0].deck.menu.roll = RollsEnum.TEMAKI;
    calculateRoundPoints(games[0].players, games[0].deck.menu);
    expect(games[0].players.map((p: Player) => p.points)).toEqual([12, 2, 14, 4, -4, -4]);
  });

  it('should give Maki points correctly for less than 5 players', () => {
    calculateRoundPoints(games[1].players, games[1].deck.menu);
    expect(games[1].players.map((p: Player) => p.points)).toEqual([6, 3]);
  });

  it('should give Temaki points correctly for only 2 players', () => {
    games[1].deck.menu.roll = RollsEnum.TEMAKI;
    calculateRoundPoints(games[1].players, games[1].deck.menu);
    expect(games[1].players.map((p: Player) => p.points)).toEqual([6, 7]);
  });

  it('should give no Maki points if second place has no Maki', () => {
    calculateRoundPoints(games[2].players, games[2].deck.menu);
    expect(games[2].players.map((p: Player) => p.points)).toEqual([0, 0, 6]);
  });

  it('should give no Temaki points if all have equal amounts of Temaki', () => {
    games[2].deck.menu.roll = RollsEnum.TEMAKI;
    calculateRoundPoints(games[2].players, games[2].deck.menu);
    expect(games[2].players.map((p: Player) => p.points)).toEqual([0, 0, 6]);
  });
});

describe('calculateAppetizerPoints', function () {
  const roomCode = 'code';
  const players = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

  const hands = [
    [],
    [
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.ONIGIRI, 0, OnigiriNameEnum.CIRCLE),
    ],
    [
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.ONIGIRI, 0, OnigiriNameEnum.CIRCLE),
      new Card(AppetizersEnum.ONIGIRI, 1, OnigiriNameEnum.SQUARE),
    ],
    [
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.ONIGIRI, 0, OnigiriNameEnum.CIRCLE),
      new Card(AppetizersEnum.ONIGIRI, 1, OnigiriNameEnum.SQUARE),
      new Card(AppetizersEnum.ONIGIRI, 2, OnigiriNameEnum.TRIANGLE),
    ],
    [
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.ONIGIRI, 0, OnigiriNameEnum.CIRCLE),
      new Card(AppetizersEnum.ONIGIRI, 1, OnigiriNameEnum.SQUARE),
      new Card(AppetizersEnum.ONIGIRI, 2, OnigiriNameEnum.TRIANGLE),
      new Card(AppetizersEnum.ONIGIRI, 3, OnigiriNameEnum.RECTANGLE),
    ],
    [
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.DUMPLING),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.SASHIMI),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.TEMPURA),
      new Card(AppetizersEnum.ONIGIRI, 0, OnigiriNameEnum.CIRCLE),
      new Card(AppetizersEnum.ONIGIRI, 1, OnigiriNameEnum.CIRCLE),
      new Card(AppetizersEnum.ONIGIRI, 2, OnigiriNameEnum.SQUARE),
      new Card(AppetizersEnum.ONIGIRI, 3, OnigiriNameEnum.SQUARE),
      new Card(AppetizersEnum.ONIGIRI, 4, OnigiriNameEnum.TRIANGLE),
      new Card(AppetizersEnum.ONIGIRI, 5, OnigiriNameEnum.RECTANGLE),
    ],
  ];

  const edamameHands = [
    [[new Card(AppetizersEnum.EDAMAME)], [], [], [], [], []],
    [
      [new Card(AppetizersEnum.EDAMAME)],
      [new Card(AppetizersEnum.EDAMAME)],
      [new Card(AppetizersEnum.EDAMAME)],
      [new Card(AppetizersEnum.EDAMAME)],
      [new Card(AppetizersEnum.EDAMAME)],
      [new Card(AppetizersEnum.EDAMAME), new Card(AppetizersEnum.EDAMAME)],
    ],
    [
      [new Card(AppetizersEnum.EDAMAME)],
      [
        new Card(AppetizersEnum.EDAMAME),
        new Card(AppetizersEnum.EDAMAME),
        new Card(AppetizersEnum.EDAMAME),
      ],
      [new Card(AppetizersEnum.EDAMAME)],
      [new Card(AppetizersEnum.EDAMAME)],
      [],
      [],
    ],
  ];

  const game = new Game(
    clone(menus.firstMeal),
    players.length,
    roomCode,
    players[0],
    'hostIp',
    'socketId',
    new MockConnection(),
  );

  addPlayers(game, players);

  game.players.forEach((p: Player, index: number) => {
    p.playedCards = hands[index];
  });

  beforeEach(() => {
    // Reset points before each test
    game.players.forEach((p: Player) => (p.points = 0));
  });

  it('should give Dumpling points correctly', () => {
    game.deck.menu.appetizers = [AppetizersEnum.DUMPLING];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 1, 3, 6, 10, 15]);
  });

  it('should give Eel points correctly', () => {
    game.deck.menu.appetizers = [AppetizersEnum.EEL];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([0, -3, 7, 7, 7, 0]);
  });

  it('should give Onigiri points correctly', () => {
    game.deck.menu.appetizers = [AppetizersEnum.ONIGIRI];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 1, 4, 9, 16, 20]);
  });

  it('should give Sashimi points correctly', () => {
    game.deck.menu.appetizers = [AppetizersEnum.SASHIMI];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 0, 0, 10, 10, 20]);
  });

  it('should give Tempura points correctly', () => {
    game.deck.menu.appetizers = [AppetizersEnum.TEMPURA];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 0, 5, 5, 10, 10]);
  });

  it('should give Tofu points correctly', () => {
    game.deck.menu.appetizers = [AppetizersEnum.TOFU];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 2, 6, 0, 0, 0]);
  });

  it('should give 0 points per card when only one player has Edamame', () => {
    game.deck.menu.appetizers = [AppetizersEnum.EDAMAME];
    game.players.forEach((p: Player, index: number) => {
      p.playedCards = edamameHands[0][index];
    });
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('should give 4 points per card when 6 players have any Edamame', () => {
    game.players.forEach((p: Player, index: number) => {
      p.playedCards = edamameHands[1][index];
    });
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([4, 4, 4, 4, 4, 8]);
  });

  it('should give 3 points per card when 4 players have any Edamame', () => {
    game.players.forEach((p: Player, index: number) => {
      p.playedCards = edamameHands[2][index];
    });
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map((p: Player) => p.points)).toEqual([3, 9, 3, 3, 0, 0]);
  });
});

describe('calculateSpecialPoints', function () {
  const roomCode = 'code';
  const players = ['P1', 'P2', 'P3', 'P4'];

  const hands = [
    [
      // Other colour cards
      new Card(DessertsEnum.PUDDING),
      new Card(AppetizersEnum.EEL),
      new Card(AppetizersEnum.TOFU),
      new Card(AppetizersEnum.SASHIMI),
      new Card(RollsEnum.TEMAKI),

      // Repeat colour cards
      new Card(SpecialsEnum.CHOPSTICKS),
      new Card(SpecialsEnum.CHOPSTICKS),
      new Card(SpecialsEnum.CHOPSTICKS),
      new Card(SpecialsEnum.CHOPSTICKS),
    ],
    [
      new Card(SpecialsEnum.WASABI, 0, 4),
      new Card(SpecialsEnum.SOY_SAUCE),
      new Card(SpecialsEnum.TEA),
      new Card(SpecialsEnum.TAKEOUT_BOX),

      // Other colour cards

      // Repeat colour cards
      new Card(NigiriEnum.EGG),
      new Card(NigiriEnum.EGG),
    ],
    [
      new Card(SpecialsEnum.WASABI),
      new Card(SpecialsEnum.SOY_SAUCE),
      new Card(SpecialsEnum.TEA),
      new Card(SpecialsEnum.TAKEOUT_BOX),
      new Card(SpecialsEnum.TAKEOUT_BOX),

      // Other colour cards
      new Card(AppetizersEnum.EEL),

      // Repeat colour cards
      new Card(NigiriEnum.EGG),
      new Card(NigiriEnum.EGG),
      new Card(NigiriEnum.EGG),
    ],
    [
      new Card(SpecialsEnum.WASABI, 0, 2),
      new Card(SpecialsEnum.SOY_SAUCE),
      new Card(SpecialsEnum.SOY_SAUCE),
      new Card(SpecialsEnum.TEA),
      new Card(SpecialsEnum.TEA),
      new Card(SpecialsEnum.TAKEOUT_BOX),
      new Card(SpecialsEnum.TAKEOUT_BOX),
      new Card(SpecialsEnum.TAKEOUT_BOX),

      // Other colour cards
      new Card(DessertsEnum.PUDDING),

      // Repeat colour cards
      new Card(NigiriEnum.EGG),
      new Card(NigiriEnum.EGG),
      new Card(NigiriEnum.EGG),
    ],
  ];

  const game = new Game(
    clone(menus.firstMeal),
    players.length,
    roomCode,
    players[0],
    'hostIp',
    'socketId',
    new MockConnection(),
  );

  addPlayers(game, players);

  game.players.forEach((p: Player, index: number) => {
    p.playedCards = hands[index];
  });

  beforeEach(() => {
    game.players.forEach((p: Player) => (p.points = 0));
  });

  const removeNigiriPoints = () => {
    game.players[1].points -= 2;
    game.players[2].points -= 3;
    game.players[3].points -= 3;
  };

  it('should give Wasabi points correctly', () => {
    game.deck.menu.specials = [SpecialsEnum.WASABI];
    calculateRoundPoints(game.players, game.deck.menu);
    removeNigiriPoints();
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 4, 0, 2]);
  });

  it('should give Soy Sauce points correctly', () => {
    game.deck.menu.specials = [SpecialsEnum.SOY_SAUCE];
    calculateRoundPoints(game.players, game.deck.menu);
    removeNigiriPoints();
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 0, 4, 8]);
  });

  it('should give Tea points correctly', () => {
    game.deck.menu.specials = [SpecialsEnum.TEA];
    calculateRoundPoints(game.players, game.deck.menu);
    removeNigiriPoints();
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 0, 4, 8]);
  });

  it('should give Takeout Box points correctly', () => {
    game.deck.menu.specials = [SpecialsEnum.TAKEOUT_BOX];
    calculateRoundPoints(game.players, game.deck.menu);
    removeNigiriPoints();
    expect(game.players.map((p: Player) => p.points)).toEqual([0, 2, 4, 6]);
  });
});

describe('calculateDessertPoints', function () {
  const roomCode = 'code';
  const players = ['P1', 'P2', 'P3'];

  const hands = [
    [
      [],
      [
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.FRUIT, 0, {
          watermelon: 1,
          pineapple: 1,
          orange: 1,
        }),
      ],
      [
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.FRUIT, 0, {
          watermelon: 3,
          pineapple: 3,
          orange: 3,
        }),
      ],
    ],
    [
      [
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.FRUIT, 0, {
          watermelon: 5,
          pineapple: 5,
          orange: 10,
        }),
      ],
      [
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.FRUIT, 0, {
          watermelon: 4,
          pineapple: 2,
          orange: 0,
        }),
      ],
      [
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.PUDDING),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.GREEN_TEA_ICE_CREAM),
        new Card(DessertsEnum.FRUIT, 0, {
          watermelon: 0,
          pineapple: 2,
          orange: 2,
        }),
      ],
    ],
  ];

  // Set up game with different roll depending on test case number (num)
  const setupGame = (num: number) => {
    const game = new Game(
      clone(menus.firstMeal),
      players.length,
      roomCode,
      players[0],
      'hostIp',
      'socketId',
      new MockConnection(),
    );

    addPlayers(game, players);

    game.setupDeck();
    game.players.forEach((p: Player, index: number) => {
      p.dessertCards = hands[num][index];
    });

    return game;
  };

  const games = [setupGame(0), setupGame(1)];

  beforeEach(() => {
    games.forEach((g: Game) => g.players.forEach((p: Player) => (p.points = 0)));
  });

  it('should give Pudding points correctly with different counts', () => {
    games[0].deck.menu.dessert = DessertsEnum.PUDDING;
    calculateGamePoints(games[0].players, games[0].deck.menu);
    expect(games[0].players.map((p: Player) => p.points)).toEqual([-6, 0, 6]);
  });

  it('should give Pudding points correctly with same counts', () => {
    games[1].deck.menu.dessert = DessertsEnum.PUDDING;
    calculateGamePoints(games[1].players, games[1].deck.menu);
    expect(games[1].players.map((p: Player) => p.points)).toEqual([0, 0, 0]);
  });

  it('should give Ice Cream points correctly when count is divisible by 4', () => {
    games[0].deck.menu.dessert = DessertsEnum.GREEN_TEA_ICE_CREAM;
    calculateGamePoints(games[0].players, games[0].deck.menu);
    expect(games[0].players.map((p: Player) => p.points)).toEqual([0, 12, 24]);
  });

  it('should give Ice Cream points correctly when count is not divisible by 4', () => {
    games[1].deck.menu.dessert = DessertsEnum.GREEN_TEA_ICE_CREAM;
    calculateGamePoints(games[1].players, games[1].deck.menu);
    expect(games[1].players.map((p: Player) => p.points)).toEqual([0, 0, 12]);
  });

  it('should give Fruit points correctly for all same counts', () => {
    games[0].deck.menu.dessert = DessertsEnum.FRUIT;
    calculateGamePoints(games[0].players, games[0].deck.menu);
    expect(games[0].players.map((p: Player) => p.points)).toEqual([-6, 0, 9]);
  });

  it('should give Fruit points correctly for different counts', () => {
    games[1].deck.menu.dessert = DessertsEnum.FRUIT;
    calculateGamePoints(games[1].players, games[1].deck.menu);
    expect(games[1].players.map((p: Player) => p.points)).toEqual([30, 5, 0]);
  });
});
