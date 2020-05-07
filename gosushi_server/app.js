const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4001;
const index = require('./routes/index');

const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

const Game = require('./classes/game');
const rooms = {};

io.on('connection', socket => {
  console.log('New client connected');

  socket.on('hostGame', (menu, numPlayers, roomCode, username) => {
    socket.join([roomCode], e => {
      if (rooms[roomCode] && rooms[roomCode].playerNames.length !== 0) {
        socket.emit(
          'newPlayer',
          `Connection failed: Room code "${roomCode}" is being used.`
        );
        return;
      } else if (e) {
        socket.emit('newPlayer', `Connection failed: Erorr joining room: ${e}`);
        return;
      }
      rooms[roomCode] = new Game(menu, numPlayers, roomCode, username);

      io.to(roomCode).emit('newPlayer', [`${username} has joined the game`]);
    });
  });

  socket.on('joinGame', (username, roomCode) => {
    socket.join([roomCode], e => {
      const game = rooms[roomCode];
      if (!game) {
        socket.emit(
          'newPlayer',
          `Connection failed: Invalid room code "${roomCode}".`
        );
        return;
      } else if (game.playerNames.length === game.numPlayers) {
        socket.emit(
          'newPlayer',
          `Connection failed: Room with code "${roomCode}" is already full.`
        );
        return;
      } else if (e) {
        socket.emit('newPlayer', `Connection failed: Erorr joining room: ${e}`);
        return;
      }

      const { playerNames } = game;
      playerNames.push(username);

      io.to(roomCode).emit('newPlayer', playerNames);

      if (playerNames.length === game.numPlayers) {
        console.log('start game');
        game.startRound();
        io.to(roomCode).emit('startGame', roomCode);
      }
    });
  });

  socket.on('boardLoad', (roomCode) => {
    io.to(roomCode).emit('dealHand');
  });
});

const dealHand = () => {
  const hand = [];
  io.clients(roomCode).array.forEach((element, idx) => {
    element.emit('dealHand', hand[idx]);
  });
};

server.listen(port, () => console.log(`Listening on port ${port}`));
