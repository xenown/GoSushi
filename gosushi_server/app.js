const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.SERVERPORT;
const index = require('./routes/index');

const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

const generateRoomCode = require('./util/roomCodes');
const Game = require('./classes/game');
const rooms = {};   // room code to Game obj
const socketToRoom = {};    // socket id to room code

io.on('connection', socket => {
  var clientIp = socket.request.connection.remoteAddress;
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
    roomCode = generateRoomCode(new Set(Object.keys(rooms)));
    if (roomCode === false) {
      socket.emit(
        'getActivePlayers',
        `Connection failed: Could not generate unique room code.`
      );
      return;
    }
    return socket.join([roomCode], e => {
      if (e) {
        socket.emit(
          'getActivePlayers',
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
      console.log(`${username} joined ${socket.id}`);
      io.to(roomCode).emit('getRoomCode', roomCode);
      io.to(roomCode).emit('getActivePlayers', [username], menu);
      io.to(roomCode).emit('getNumPlayers', numPlayers);
    });
  };

  socket.on('hostGame', handleHostGame);

  socket.on('joinGame', (username, roomCode) => {
    socket.join([roomCode], e => {
      const game = rooms[roomCode];
      if (!game) {
        socket.emit(
          'getActivePlayers',
          `Connection failed: Invalid room code "${roomCode}".`
        );
        return;
      } else if (game.players.length === game.numPlayers) {
        socket.emit(
          'getActivePlayers',
          `Connection failed: Room with code "${roomCode}" is already full.`
        );
        return;
      } else if (
        game.players.reduce((acc, p) => {
          return acc || p.name === username;
        }, false)
      ) {
        socket.emit(
          'getActivePlayers',
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
          'getActivePlayers',
          `Connection failed: Error joining room: ${e}`
        );
        return;
      }

      game.addPlayer(username, socket.id, clientIp);
      const { players } = game;

      socketToRoom[socket.id] = roomCode;
      console.log(`joined ${socket.id}`);

      io.to(roomCode).emit(
        'getActivePlayers',
        players.map(p => p.name),
        game.deck.menu
      );
      io.to(roomCode).emit('getNumPlayers', game.numPlayers);

      if (players.length === game.numPlayers) {
        game.startRound();
      }
    });
  });

  socket.on('autoPlayers', (menu, numPlayers, username) => {
    handleHostGame(menu, numPlayers, username).then(() => {
      let game = rooms[socketToRoom[socket.id]];

      for (let i = 2; i <= numPlayers; i++) {
        game.addPlayer(`Player${i}`, i, true);
      }
      socket.emit('getNumPlayers', game.numPlayers);
      socket.emit(
        'getActivePlayers',
        game.players.map(p => p.name),
        game.deck.menu
      );
      game.startRound();
    });
  });

  socket.on('gameInitiated', roomCode => {
    const game = rooms[roomCode];
    game.gameStarted = true;
    io.to(roomCode).emit('startGame', roomCode);
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
      game.finishedTurn(sendTurnData, doSpecialAction, sendGameResults, sendLogEntry);

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
        game.finishedTurn(sendTurnData, doSpecialAction, sendGameResults, sendLogEntry);
      }
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
        delete socketToRoom[socket.id];
        // socket.to(roomCode).emit('playerQuit', game.players[index].name);
        sendLogEntry(roomCode, {player: game.players[index].name, playedCard: "Player Quit"});
      } else {
        game.players = game.players.filter(p => p.socketId !== socket.id);
        socket.to(roomCode).emit(
          'getActivePlayers',
          game.players.map(p => p.name),
          game.deck.menu
        );
      }
    }
    // TODO: If the host leaves, end game
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
