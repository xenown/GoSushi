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
  socket.on('hostGame', (menu, numPlayers, roomCode, username) => {
    socket.join([roomCode], e => {
      if (rooms[roomCode] && rooms[roomCode].numPlayers !== 0) {
        io.to(socket.id).emit(
          'newPlayer',
          `Connection failed: Room code "${roomCode}" is being used.`
        );
      } else if (e) {
        io.to(socket.id).emit(
          'newPlayer',
          `Connection failed: Erorr joining room: ${e}`
        );
      }
      rooms[roomCode] = new Game(menu, numPlayers, roomCode, username);

      io.to(roomCode).emit('newPlayer', [`${username} has joined the game`]);
    });
  });

  socket.on('joinGame', (username, roomCode) => {
    socket.join([roomCode], e => {
      const game = rooms[roomCode];
      if (!game) {
        io.to(socket.id).emit(
          'newPlayer',
          `Connection failed: Invalid room code "${roomCode}".`
        );
        return;
      } else if (game.playerNames.size == game.numPlayers) {
        io.to(socket.id).emit(
          'newPlayer',
          `Connection failed: Room with code "${roomCode}" is already full.`
        );
        return;
      } else if (e) {
        io.to(socket.id).emit(
          'newPlayer',
          `Connection failed: Erorr joining room: ${e}`
        );
      }

      const { playerNames } = game;
      playerNames.push(username);

      io.to(roomCode).emit('newPlayer', playerNames);
    });
  });

  console.log('New client connected');
});

server.listen(port, () => console.log(`Listening on port ${port}`));
