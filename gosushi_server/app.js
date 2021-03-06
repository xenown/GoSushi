const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 5000;
const index = require('./routes/index');
const path = require('path');

const app = express();
// const cors = require('cors');

app.set('port', port);
// app.use(cors());
app.use(index);

app.use(express.static(path.resolve(__dirname, '../gosushi_client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../gosushi_client/build', 'index.html'));
})

const server = http.createServer(app);
const io = socketIo(server);

const generateRoomCode = require('./util/roomCodes');
const Game = require('./classes/game');
const rooms = {};   // room code to Game obj
const socketToRoom = {};    // socket id to room code

io.on('connection', socket => {
  var clientIp = socket.request.headers["x-forwarded-for"];
  if (clientIp){
    var list = clientIp.split(",");
    clientIp = list[list.length-1];
  } else {
    clientIp = socket.request.connection.remoteAddress; // Routing ip inside of Heroku network, useless fallback if no real ip is found
  }
  console.log(`New client connected from address ${clientIp}`);

  const existingGames = Object.entries(rooms).filter(roomPair => {
    return roomPair[1].players.find(player => {
      return clientIp === player.ip && player.isAuto;
    });
  });

  if (existingGames.length !== 0) {
    socket.emit(
      'rejoinOption',
      existingGames.map(pair => { return pair[0]; })
    );
  };

  socket.on('rejoinGame', roomCode => {
    const game = rooms[roomCode];
    if (game) {
      const playerIndex = game.players.findIndex(player => {
        return clientIp === player.ip && player.isAuto;
      });
      if (playerIndex >= 0){
        socket.join([roomCode], e => {
          if (e) {
            socket.emit('rejoinGameResult');
          } else {
            socketToRoom[socket.id] = roomCode;
            game.players[playerIndex].socketId = socket.id;
            game.players[playerIndex].isAuto = false;
            socket.emit('rejoinGameResult', roomCode);
            sendLogEntry(roomCode, {player: game.players[playerIndex].name, playedCard: "Player Reconnect"});
          }
        });
      } else {
        socket.emit('rejoinGameResult');
      }
    }
  });

  const handleHostGame = async (menu, numPlayers, username) => {
    //Assuming menu contains roll, appetizers, specials, dessert

    if (!socketToRoom[socket.id]) {
      const roomCode = generateRoomCode(new Set(Object.keys(rooms)));

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
        return;
      }

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
          clientIp,
          socket.id
        );

        socketToRoom[socket.id] = roomCode;
        console.log(
          `${username} with socketId ${socket.id} joined ${roomCode}`
        );

        const playerData = { name: username, socketId: socket.id };
        io.to(roomCode).emit('gameInformation', menu, roomCode);
        io.to(roomCode).emit('getActivePlayers', [playerData]);
        io.to(roomCode).emit('getNumPlayers', numPlayers);
      });
    } else {
      const roomCode = socketToRoom[socket.id];
      console.log(`${username} already in room ${roomCode} => likely reusing room`);

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

      io.to(roomCode).emit('gameInformation', menu, roomCode);
      io.to(roomCode).emit('getActivePlayers', activePlayers);
      io.to(roomCode).emit('getNumPlayers', numPlayers);
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
      } else if (game.players.length === game.numPlayers || game.players.length >= 8) {
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
      // } else if (game.players.find(player => { return clientIp === player.ip; })) {
      //   socket.emit(
      //     'getActivePlayers',
      //     `Connection failed: You are already in this game session.`
      //   );
      //   return;
      } else if (e) {
        socket.emit(
          'connectionFailed',
          `Connection failed: Error joining room: ${e}`
        );
        return;
      }

      game.addPlayer(username, socket.id, clientIp);
      const { players } = game;

      socketToRoom[socket.id] = roomCode;
      console.log(`${username} with socketId ${socket.id} joined ${roomCode}`);

      io.to(roomCode).emit('gameInformation', game.deck && game.deck.menu, roomCode);
      io.to(roomCode).emit(
        'getActivePlayers',
        players.map(p => ({
          name: p.name,
          socketId: p.socketId,
        }))
      );
      io.to(roomCode).emit('getNumPlayers', game.numPlayers);
    });
  });

  socket.on('autoPlayers', (menu, numPlayers, username) => {
    handleHostGame(menu, numPlayers, username).then(() => {
      const roomCode = socketToRoom[socket.id];
      let game = rooms[roomCode];

      for (let i = 2; i <= numPlayers; i++) {
        game.addPlayer(`Player${i}`, i, true);
      }

      socket.emit(
        'getActivePlayers',
        game.players.map(p => ({
          name: p.name,
          socketId: p.socketId,
        }))
      );
      game.startRound();
    });
  });

  socket.on('gameInitiated', roomCode => {
    const game = rooms[roomCode];
    game.startRound();
    game.gameStarted = true;

    io.to(roomCode).emit('startGame', roomCode);
    io.to(roomCode).emit('updateRoundNumber', 1);
  });

  socket.on('boardLoaded', (roomCode, sendMenu) => {
    const game = rooms[roomCode];
    if (
      game &&
      game.players &&
      game.players.find(val => val.socketId === socket.id) &&
      !game.isGameOver &&
      game.gameStarted
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
      if (game.specialActions.length > 0) {   // everyone has played their cards, now performing special actions
        let { card, playerName } = game.specialActions[0];
        if (playerName === player.name) {
          let data = game.getSpecialData(playerName, card);
          io.to(player.socketId).emit('doSpecialAction', card, data);
        } else {
          io.to(player.socketId).emit('waitForAction', playerName, card.name);
        }
      }
    } else {
      socket.emit('unknownGame');
    }
  });

  // update the data in the WaitingRoom so that other players can see the changes in the selection
  socket.on('broadcastSelection', (menu, numPlayers, roomCode) => {
    socket.to(roomCode).emit('gameInformation', menu, roomCode); // socket emit because don't need to update menu in HostGame (don't emit to sender)
    io.to(roomCode).emit('getNumPlayers', numPlayers); // io emit so that the WaitingRoom in HostGame updates (do emit to sender)
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

    }
  });

  const sendLogEntry = (roomCode, entry) => {
    io.to(roomCode).emit('newLogEntry', entry);
  };

  socket.on('handleSpecialAction', (roomCode, speCard, chosenCard) => {
    const game = rooms[roomCode];
    if (game && game.players) {
      let player = game.players.find(val => val.socketId === socket.id);
      if (player) {
        game.handleSpecialAction(player, speCard, chosenCard, sendLogEntry);
        game.specialActions.shift();
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

  // client emit when they continue after game is over
  socket.on('resetRoom', (roomCode, playerName) => {
    const game = rooms[roomCode];
    if (!!socketToRoom[socket.id]) {
      if (game.hostPlayer.socketId === socket.id) {
        game.players.unshift(game.hostPlayer);
      } else {
        game.addPlayer(playerName, socket.id);
      }
      io.to(roomCode).emit(
        'getActivePlayers',
        game.players.map(p => ({
          name: p.name,
          socketId: p.socketId,
        }))
      );
      io.to(roomCode).emit('getNumPlayers', game.numPlayers);
      socket.emit('gameInformation', null, roomCode);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
    // need to remove that player from the display
    let roomCode = socketToRoom[socket.id];
    const game = rooms[roomCode];
    if (game) {
      if (socket.id === game.hostPlayer.socketId) {
        socket.to(roomCode).emit('quitGame');
        delete rooms[roomCode];
      } else if (game.gameStarted && !game.isGameOver) {
        const index = game.players.findIndex(p => p.socketId === socket.id);
        game.players[index].isAuto = true;
        game.players[index].socketId = null;
        delete socketToRoom[socket.id];
        sendLogEntry(roomCode, {player: game.players[index].name, playedCard: "Player Quit"});
      } else {
        game.players = game.players.filter(p => p.socketId !== socket.id);
        socket.to(roomCode).emit(
          'getActivePlayers',
          game.players.map(p => ({
            name: p.name,
            socketId: p.socketId,
          }))
        );
      }
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
