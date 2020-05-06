const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4001;
const index = require('./routes/index');

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

const TestClass = require('./test');
const test = new TestClass();
const rooms = {};

io.on('connection', socket => {
  socket.on('hostGame', (username, roomCode) => {
    socket.join([roomCode], () => {
      rooms[roomCode] = [username];
      io.to(roomCode).emit(
        'newPlayer',
        rooms[roomCode].map(player => `${player} has joined the game`)
      );
    });
  });

  socket.on('joinGame', (username, roomCode) => {
    socket.join([roomCode], () => {
      if (!rooms[roomCode]) {
        io.to(socket.id).emit(
          'newPlayer',
          `Connection failed: Invalid room code "${roomCode}"`
        );
        return;
      }

      rooms[roomCode].push(username);

      io.to(roomCode).emit(
        'newPlayer',
        rooms[roomCode].map(player => `${player} has joined the game`)
      );
    });
  });

  console.log('New client connected');
  getApiAndEmit(socket);
});

const getApiAndEmit = socket => {
  const response = new Date();
  socket.emit('FromAPI', response);
  test.printSomething('called FromAPI');
};

server.listen(port, () => console.log(`Listening on port ${port}`));
