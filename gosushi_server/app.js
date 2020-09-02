const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.SERVERPORT;
const index = require('./routes/index');

const app = express();
const cors = require('cors');

app.set('port', port);
app.use(cors());
app.use(index);

const server = http.createServer(app);
const io = socketIo(server);

const generateRoomCode = require('./util/roomCodes');
const Game = require('./classes/game');
const rooms = {};
const socketToRoom = {};

index.get('/generateRoomCode', (req, res) => {
  const roomCode = generateRoomCode(new Set(Object.keys(rooms)));
  res.status(200).send({ roomCode: roomCode });
});

io.on('connection', socket => {
  console.log('New client connected');

  const handleHostGame = async (roomCode, menu, numPlayers, username) => {
    //Assuming menu contains roll, appetizers, specials, dessert
    if (roomCode === false) {
      socket.emit(
        'connectionFailed',
        `Connection failed: Could not generate unique room code.`
      );
      return;
    } else if (
      !!rooms[roomCode] &&
      rooms[roomCode].hostPlayer.socketId != socket.id
    ) {
      socket.emit(
        'connectionFailed',
        `Connection failed: The provided room code is in use with a different host.`
      );
    }

    if (!!socket.rooms[roomCode]) {
      console.log(`${username} already in room ${roomCode}`);

      if (!!rooms[roomCode]) {
        rooms[roomCode].newGame(menu, numPlayers, username);
      } else {
        rooms[roomCode] = new Game(
          menu,
          numPlayers,
          roomCode,
          username,
          socket.id
        );
      }

      let activePlayers = rooms[roomCode].players.map(p => ({
        name: p.name,
        socketId: p.socketId,
      }));

      io.to(roomCode).emit('getActivePlayers', activePlayers, menu);
      io.to(roomCode).emit('getNumPlayers', numPlayers);
    } else {
      socket.join([roomCode], e => {
        if (e) {
          socket.emit(
            'connectionFailed',
            `Connection failed: Error joining room: ${e}`
          );
          return;
        }
        rooms[roomCode] = new Game(
          menu,
          numPlayers,
          roomCode,
          username,
          socket.id
        );

        socketToRoom[socket.id] = roomCode;
        console.log(
          `${username} with socketId ${socket.id} joined ${roomCode}`
        );

        const playerData = { name: username, socketId: socket.id };
        io.to(roomCode).emit('getActivePlayers', [playerData], menu);
        io.to(roomCode).emit('getNumPlayers', numPlayers);
      });
    }
  };

  socket.on('hostGame', handleHostGame);

  socket.on('joinGame', (username, roomCode) => {
    socket.join([roomCode], e => {
      const game = rooms[roomCode];
      if (!game) {
        socket.emit(
          'connectionFailed',
          `Connection failed: Invalid room code "${roomCode}".`
        );
        return;
      } else if (game.players.length === game.numPlayers) {
        socket.emit(
          'connectionFailed',
          `Connection failed: Room with code "${roomCode}" is already full.`
        );
        return;
      } else if (
        game.players.reduce((acc, p) => {
          return acc || p.name === username;
        }, false)
      ) {
        socket.emit(
          'connectionFailed',
          `Connection failed: Player name ${username} is already in use, please use a different name.`
        );
        return;
      } else if (e) {
        socket.emit(
          'connectionFailed',
          `Connection failed: Error joining room: ${e}`
        );
        return;
      }

      game.addPlayer(username, socket.id);
      const { players } = game;

      socketToRoom[socket.id] = roomCode;
      console.log(`${username} with socketId ${socket.id} joined ${roomCode}`);

      io.to(roomCode).emit(
        'getActivePlayers',
        players.map(p => ({
          name: p.name,
          socketId: p.socketId,
        })),
        game.deck.menu
      );
      io.to(roomCode).emit('getNumPlayers', game.numPlayers);

      if (players.length === game.numPlayers) {
        game.startRound();
      }
    });
  });

  socket.on('autoPlayers', (roomCode, menu, numPlayers, username) => {
    handleHostGame(roomCode, menu, numPlayers, username).then(() => {
      let game = rooms[socketToRoom[socket.id]];

      for (let i = 2; i <= numPlayers; i++) {
        game.addPlayer(`Player${i}`, i, true);
      }
      socket.emit('getNumPlayers', game.numPlayers);
      socket.emit(
        'getActivePlayers',
        game.players.map(p => ({
          name: p.name,
          socketId: p.socketId,
        })),
        game.deck.menu
      );
      game.startRound();
    });
  });

  socket.on('gameInitiated', roomCode => {
    const game = rooms[roomCode];
    game.gameStarted = true;
    io.to(roomCode).emit('startGame', roomCode);
    io.to(roomCode).emit('updateRoundNumber', 1);
  });

  socket.on('boardLoaded', (roomCode, sendMenu) => {
    const game = rooms[roomCode];
    if (
      game &&
      game.players &&
      game.players.find(val => val.socketId === socket.id)
    ) {
      const player = game.players.find(val => val.socketId === socket.id);

      const playersData = game.getPlayersData();
      while (
        playersData &&
        playersData[0] &&
        playersData[0].socketId !== socket.id
      ) {
        playersData.push(playersData.shift());
      }

      if (sendMenu) {
        socket.emit('sendMenuData', game.deck.menu);
      }
      socket.emit('sendTurnData', player ? player.hand : [], playersData);
    } else {
      socket.emit('unknownGame');
    }
  });

  const sendTurnData = (socketId, hand, otherPlayerData) =>
    io.to(socketId).emit('sendTurnData', hand, otherPlayerData);

  // specialCards: [Card]
  const doSpecialAction = (playerName, players, specialCard, data) =>
    players.forEach(p => {
      if (p.name === playerName) {
        io.to(p.socketId).emit('doSpecialAction', specialCard, data);
      } else {
        io.to(p.socketId).emit('waitForAction', playerName, specialCard.name);
      }
    });

  const updateRound = (roomCode, roundNumber) =>
    io.to(roomCode).emit('updateRoundNumber', roundNumber);

  const sendGameResults = (socketId, playerData, isHost) =>
    io.to(socketId).emit('gameResults', playerData, isHost);

  socket.on('finishTurn', (roomCode, card, specials) => {
    const game = rooms[roomCode];
    if (
      game &&
      game.players &&
      game.players.find(val => val.socketId === socket.id)
    ) {
      const player = game.players.find(val => val.socketId === socket.id);
      player.playCardFromHand(card);
      specials.forEach(c => player.playUsedCard(c));

      // keeping those seperate for now
      // might change to everyone can see everyones points rather than only seeing your own
      game.finishedTurn(
        sendTurnData,
        doSpecialAction,
        sendGameResults,
        updateRound,
        sendLogEntry
      );

      const playersData = game.getPlayersData();
      let count = 0;
      while (playersData && playersData[0] && count++ < playersData.length) {
        if (playersData[0].socketId) {
          io.to(playersData[0].socketId).emit('playerStatus', playersData);
        }
        playersData.push(playersData.shift());
      }

      if (game.isGameOver) {
        io.to(roomCode).emit(
          'getActivePlayers',
          game.players.map(p => ({
            name: p.name,
            socketId: p.socketId,
          }))
        );
      }
    }
  });

  const sendLogEntry = (roomCode, entry) =>
    io.to(roomCode).emit('newLogEntry', entry);

  socket.on('handleSpecialAction', (roomCode, speCard, chosenCard) => {
    const game = rooms[roomCode];
    if (game && game.players) {
      let player = game.players.find(val => val.socketId === socket.id);
      if (player) {
        game.handleSpecialAction(player, speCard, chosenCard, sendLogEntry);
        socket.to(roomCode).emit('completedSpecialAction');
        game.finishedTurn(
          sendTurnData,
          doSpecialAction,
          sendGameResults,
          sendLogEntry
        );
      }
    }
  });

  socket.on('resetRoom', roomCode => {
    const game = rooms[roomCode];
    if (!!socketToRoom[socket.id]) {
      socket.emit(
        'getActivePlayers',
        game.players.map(p => ({
          name: p.name,
          socketId: p.socketId,
        }))
      );
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
    // need to remove that player from the display
    let roomCode = socketToRoom[socket.id];
    const game = rooms[roomCode];
    if (game) {
      if (game.gameStarted && socket.id === game.hostPlayer.socketId) {
        socket.to(roomCode).emit('quitGame');
        delete rooms[roomCode];
      } else if (game.gameStarted) {
        const index = game.players.findIndex(p => p.socketId === socket.id);
        game.players[index].isAuto = true;
        game.players[index].socketId = null;
      } else {
        game.players = game.players.filter(p => p.socketId !== socket.id);
        socket.to(roomCode).emit(
          'getActivePlayers',
          game.players.map(p => ({
            name: p.name,
            socketId: p.socketId,
          })),
          game.deck.menu
        );
      }
    }
    // TODO: If the host leaves, end game
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
