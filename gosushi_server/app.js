const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4001;
const index = require('./routes/index');

const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

const Player = require('./classes/player');
const Game = require('./classes/game');
const rooms = {};

io.on('connection', socket => {
  console.log('New client connected');

  socket.on('hostGame', (menu, numPlayers, roomCode, username) => {
    socket.join([roomCode], e => {
      if (rooms[roomCode] && rooms[roomCode].players.length !== 0) {
        socket.emit(
          'newPlayer',
          `Connection failed: Room code "${roomCode}" is being used.`
        );
        return;
      } else if (e) {
        socket.emit('newPlayer', `Connection failed: Erorr joining room: ${e}`);
        return;
      }
      rooms[roomCode] = new Game(
        menu,
        numPlayers,
        roomCode,
        username,
        socket.id
      );

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
      } else if (game.players.length === game.numPlayers) {
        socket.emit(
          'newPlayer',
          `Connection failed: Room with code "${roomCode}" is already full.`
        );
        return;
      } else if (e) {
        socket.emit('newPlayer', `Connection failed: Erorr joining room: ${e}`);
        return;
      }

      const { players } = game;
      players.push(new Player(username, socket.id));

      io.to(roomCode).emit(
        'newPlayer',
        players.map(p => p.name)
      );

      if (players.length === game.numPlayers) {
        game.startRound();
        io.to(roomCode).emit('startGame', roomCode);
      }
    });
  });

  socket.on('boardLoaded', roomCode => {
    const game = rooms[roomCode];
    const player = game.players.find(val => val.socketId === socket.id);
    console.log(socket.id, player ? player.hand : 'no hand???');
    socket.emit('dealHand', player ? player.hand : []);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
