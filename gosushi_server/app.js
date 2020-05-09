const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT;
const index = require('./routes/index');

const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

const Game = require('./classes/game');
const rooms = {};
const socketToRoom = {};

io.on('connection', socket => {
  console.log('New client connected');

  socket.on('hostGame', (menu, numPlayers, roomCode, username) => {
    socket.join([roomCode], e => {
      if (rooms[roomCode] && rooms[roomCode].players.length !== 0) {
        socket.emit(
          'playerJoined',
          `Connection failed: Room code "${roomCode}" is being used.`
        );
        return;
      } else if (e) {
        socket.emit(
          'playerJoined',
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
      console.log(`joined ${socket.id}`);
      io.to(roomCode).emit('playerJoined', [username], menu);
      socket.emit('getNumPlayers', numPlayers);
    });
  });

  socket.on('joinGame', (username, roomCode) => {
    socket.join([roomCode], e => {
      const game = rooms[roomCode];
      if (!game) {
        socket.emit(
          'playerJoined',
          `Connection failed: Invalid room code "${roomCode}".`
        );
        return;
      } else if (game.players.length === game.numPlayers) {
        socket.emit(
          'playerJoined',
          `Connection failed: Room with code "${roomCode}" is already full.`
        );
        return;
      } else if (e) {
        socket.emit(
          'playerJoined',
          `Connection failed: Error joining room: ${e}`
        );
        return;
      }

      game.addPlayer(username, socket.id);
      const { players } = game;

      socketToRoom[socket.id] = roomCode;
      console.log(`joined ${socket.id}`);

      io.to(roomCode).emit(
        'playerJoined',
        players.map(p => p.name),
        game.deck.menu
      );
      socket.emit('getNumPlayers', game.numPlayers);

      if (players.length === game.numPlayers) {
        game.startRound();
        io.to(roomCode).emit('roomFilled', roomCode);
      }
    });
  });

  socket.on('gameInitiated', roomCode => {
    io.to(roomCode).emit('startGame', roomCode);
  });

  socket.on('boardLoaded', roomCode => {
    const game = rooms[roomCode];
    const player = game.players.find(val => val.socketId === socket.id);
    socket.emit('dealHand', player ? player.hand : []);
  });

  socket.on('cardSelected', (roomCode, card) => {
    const game = rooms[roomCode];
    const player = game.players.find(val => val.socketId === socket.id);
    player.playCard(card);

    const dealHandToPlayer = p => io.to(p.socketId).emit('dealHand', p.hand);
    const updatePoints = p => io.to(p.socketId).emit('updatePoints', p.points);
    // keeping those seperate for now
    // might change to everyone can see everyones points rather than only seeing your own
    game.finishedTurn(dealHandToPlayer, updatePoints);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
    // need to remove that player from the display
    let roomCode = socketToRoom[socket.id];
    const game = rooms[roomCode];
    if (game) {
      game.players = game.players.filter(p => p.socketId !== socket.id);
      socket.to(roomCode).emit(
        'playerJoined',
        game.players.map(p => p.name)
      );
    }
    // TODO: If the host leaves, end game
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
