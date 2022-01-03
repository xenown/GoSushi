import express from 'express';
import { createServer } from 'http';
import { resolve } from 'path';
import { Server, Socket } from 'socket.io';
import Card from './classes/card';
import Game from './classes/game';
import MyConnection from './classes/myConnection';
import index from './routes/index';
import IMenu from './types/IMenu';
import SocketEventEnum, * as sEvents from './types/socketEvents';

const port = process.env.PORT || 5000;
const app = express();
// const cors = require('cors');

app.set('port', port);
// app.use(cors());
app.use(index);

app.use(express.static(resolve(__dirname, '../gosushi_client/build')));
app.get('*', (_, res) => {
  res.sendFile(resolve(__dirname, '../gosushi_client/build', 'index.html'));
})

const server = createServer(app);
const io = new Server(server);

import generateRoomCode from './util/roomCodes';
const rooms: { [ roomCode: string]: Game } = {};   // room code to Game obj
const socketToRoom: { [socketId: string]: string } = {};    // socket id to room code

io.on('connection', (socket: Socket) => {
  let socketIp = socket.request.headers["x-forwarded-for"];
  if (typeof socketIp === 'string'){
    var list = socketIp.split(",");
    socketIp = list[list.length-1];
  } else {
    socketIp = socket.request.connection.remoteAddress; // Routing ip inside of Heroku network, useless fallback if no real ip is found
  }
  console.log(`New client connected from address ${socketIp}`);
  let clientIp = socketIp as string;

  const existingGames = Object.entries(rooms).filter(roomPair => {
    return roomPair[1].players.find(player => {
      return clientIp === player.ip && player.isAuto;
    });
  });

  if (existingGames.length !== 0) {
    socket.emit(
      SocketEventEnum.REJOIN_OPTION,
      { rooms: existingGames.map(pair => { return pair[0]; }) } as sEvents.IRejoinOptionProps
    );
  };

  const myConnection = new MyConnection(io);

  socket.on(SocketEventEnum.REJOIN_GAME, ({ roomCode }: sEvents.IRejoinGameProps) => {
    const game = rooms[roomCode];
    if (game) {
      const playerIndex = game.players.findIndex(player => {
        return clientIp === player.ip && player.isAuto;
      });
      if (playerIndex >= 0){
        // add the socket to the room (will receive notifications sent to the room)
        socket.join(roomCode);
        
        // update relevant data
        socketToRoom[socket.id] = roomCode;
        game.players[playerIndex].socketId = socket.id;
        game.players[playerIndex].isAuto = false;

        // send sucessful rejoin result
        socket.emit(SocketEventEnum.REJOIN_GAME_RESULT, { roomCode } as sEvents.IRejoinGameResultProps );
        myConnection.sendLogEntry(roomCode, { player: game.players[playerIndex].name, playedCard: 'Player Reconnect' });
      } else {
        // send unsucessful rejoin result
        socket.emit(SocketEventEnum.REJOIN_GAME_RESULT);
      } // if
    } // if
  });

  const handleHostGame = async ({ menu, numPlayers, username }: sEvents.IHostGameProps) => {
    //Assuming menu contains roll, appetizers, specials, dessert

    if (!socketToRoom[socket.id]) {
      const roomCode = generateRoomCode(new Set(Object.keys(rooms)));

      if (roomCode === false) {
        socket.emit(
          SocketEventEnum.CONNECTION_FAILED,
          { error: 'Connection failed: Could not generate unique room code.' } as sEvents.IConnectionFailedProps
        );
        return;
      } else if (
        !!rooms[roomCode] &&
        rooms[roomCode].hostPlayer.socketId != socket.id
      ) {
        socket.emit(
          SocketEventEnum.CONNECTION_FAILED,
          { error: 'Connection failed: The provided room code is in use with a different host.'} as sEvents.IConnectionFailedProps
        );
        return;
      }

      socket.join(roomCode);

      rooms[roomCode] = new Game(
        menu,
        numPlayers,
        roomCode,
        username,
        clientIp,
        socket.id,
        myConnection
      );

      socketToRoom[socket.id] = roomCode;
      console.log(
        `${username} with socketId ${socket.id} joined ${roomCode}`
      );

      const playerData = { name: username, socketId: socket.id };
      io.to(roomCode).emit(SocketEventEnum.GAME_INFORMATION, { menu, roomCode } as sEvents.IGameInformationProps);
      io.to(roomCode).emit(SocketEventEnum.GET_ACTIVE_PLAYERS, { activePlayers: [ playerData ] } as sEvents.IGetActivePlayersProps);
      io.to(roomCode).emit(SocketEventEnum.GET_NUMBER_PLAYERS, { numPlayers } as sEvents.IGetNumberPlayersProps);
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
          clientIp,
          socket.id,
          myConnection
        );
      }

      let activePlayers = rooms[roomCode].players.map(p => ({
        name: p.name,
        socketId: p.socketId,
      }));

      io.to(roomCode).emit(SocketEventEnum.GAME_INFORMATION, { menu, roomCode } as sEvents.IGameInformationProps);
      io.to(roomCode).emit(SocketEventEnum.GET_ACTIVE_PLAYERS, { activePlayers } as sEvents.IGetActivePlayersProps);
      io.to(roomCode).emit(SocketEventEnum.GET_NUMBER_PLAYERS, { numPlayers } as sEvents.IGetNumberPlayersProps);
    }
  };

  socket.on(SocketEventEnum.HOST_GAME, handleHostGame);

  socket.on(SocketEventEnum.JOIN_GAME, ({ username, roomCode }: sEvents.IJoinGameProps) => {
    socket.join(roomCode);
    const game = rooms[roomCode];
    if (!game) {
      socket.emit(
        SocketEventEnum.CONNECTION_FAILED,
        { error: `Connection failed: Invalid room code "${roomCode}".` } as sEvents.IConnectionFailedProps
      );
      return;
    } else if (game.players.length === game.numPlayers || game.players.length >= 8) {
      socket.emit(
        SocketEventEnum.CONNECTION_FAILED,
        { error: `Connection failed: Room with code "${roomCode}" is already full.` } as sEvents.IConnectionFailedProps
      );
      return;
    } else if (
      game.players.reduce((acc, p) => {
        return acc || p.name === username;
      }, false)
    ) {
      socket.emit(
        SocketEventEnum.CONNECTION_FAILED,
        { error: `Connection failed: Player name ${username} is already in use, please use a different name.` } as sEvents.IConnectionFailedProps
      );
      return;
    // } else if (game.players.find(player => { return clientIp === player.ip; })) {
    //   socket.emit(
    //     SocketEventEnum.GET_ACTIVE_PLAYERS,
    //     `Connection failed: You are already in this game session.`
    //   );
    //   return;
    }

    game.addPlayer(username, socket.id, clientIp);
    const { players } = game;

    socketToRoom[socket.id] = roomCode;
    console.log(`${username} with socketId ${socket.id} joined ${roomCode}`);

    io.to(roomCode).emit(
      SocketEventEnum.GAME_INFORMATION, 
      { menu: game.deck && game.deck.menu, roomCode } as sEvents.IGameInformationProps
    );
    io.to(roomCode).emit(
      SocketEventEnum.GET_ACTIVE_PLAYERS,
      { 
        activePlayers: players.map(p => ({
          name: p.name,
          socketId: p.socketId,
        }))
      } as sEvents.IGetActivePlayersProps
    );
    io.to(roomCode).emit(SocketEventEnum.GET_NUMBER_PLAYERS, { numPlayers: game.numPlayers } as sEvents.IGetNumberPlayersProps);
  });

  socket.on(SocketEventEnum.AUTO_PLAYERS, ({ menu, numPlayers, username }: sEvents.IAutoPlayersProps) => {
    handleHostGame({ menu, numPlayers, username } as sEvents.IHostGameProps).then(() => {
      const roomCode = socketToRoom[socket.id];
      let game = rooms[roomCode];

      for (let i = 2; i <= numPlayers; i++) {
        game.addPlayer(`Player${i}`, `auto-${i}`, clientIp, true);
      }

      socket.emit(
        SocketEventEnum.GET_ACTIVE_PLAYERS,
        {
          activePlayers: game.players.map(p => ({
            name: p.name,
            socketId: p.socketId,
          }))
        } as sEvents.IGetActivePlayersProps
      );
      game.startGame();
    });
  });

  socket.on(SocketEventEnum.GAME_INITIATED, ({ roomCode }: sEvents.IGameInitiatedProps) => {
    const game = rooms[roomCode];
    game.startGame();

    io.to(roomCode).emit(SocketEventEnum.START_GAME, { roomCode } as sEvents.IStartGameProps);
    io.to(roomCode).emit(SocketEventEnum.UPDATE_ROUND_NUMBER, { roundNumber: 1 } as sEvents.IUpdateRoundNumberProps);
  });

  socket.on(SocketEventEnum.BOARD_LOADED, ({ roomCode, sendMenu }: sEvents.IBoardLoadedProps) => {
    const game = rooms[roomCode];
    if (
      game &&
      game.players &&
      game.players.find(val => val.socketId === socket.id) &&
      !game.isGameOver &&
      game.gameStarted
    ) {
      const player = game.players.find(val => val.socketId === socket.id)!;

      const playersData = game.getPlayersData();
      while (
        playersData &&
        playersData[0] &&
        playersData[0].socketId !== socket.id
      ) {
        playersData.push(playersData.shift()!);
      }
      if (sendMenu) {
        socket.emit(SocketEventEnum.SEND_MENU_DATA, { menu: game.deck.menu } as sEvents.ISendMenuDataProps);
      }
      socket.emit(SocketEventEnum.SEND_TURN_DATA, { hand: player ? player.hand : [], players: playersData } as sEvents.ISendTurnDataProps);
      if (game.specialActions.length > 0) {   // everyone has played their cards, now performing special actions
        let { card, playerName } = game.specialActions[0];
        if (playerName === player.name) {
          let data = game.getSpecialData(playerName, card);
          io.to(player.socketId).emit(SocketEventEnum.DO_SPECIAL_ACTION, { specialCard: card, specialData: data } as sEvents.IDoSpecialActionProps);
        } else {
          io.to(player.socketId).emit(SocketEventEnum.WAIT_FOR_ACTION, { playerName, cardName: card.name } as sEvents.IWaitForSpecialActionProps);
        }
      }
    } else {
      socket.emit(SocketEventEnum.UNKNOWN_GAME);
    }
  });

  // update the data in the WaitingRoom so that other players can see the changes in the selection
  socket.on(SocketEventEnum.BROADCAST_SELECTION, ({ menu, numPlayers, roomCode }: sEvents.IBroadcastSelectionProps) => { // TODO: might need to change to optional menu!!
    socket.to(roomCode).emit( // socket emit because don't need to update menu in HostGame (don't emit to sender)
      SocketEventEnum.GAME_INFORMATION,
      { menu, roomCode } as sEvents.IGameInformationProps);
    io.to(roomCode).emit(SocketEventEnum.GET_NUMBER_PLAYERS, { numPlayers } as sEvents.IGetNumberPlayersProps); // io emit so that the WaitingRoom in HostGame updates (do emit to sender)
  });

  socket.on(SocketEventEnum.FINISH_TURN, ({ roomCode, card, specials }: sEvents.IFinishTurnProps) => {
    const game = rooms[roomCode];
    if (
      game &&
      game.players &&
      game.players.find(val => val.socketId === socket.id)
    ) {
      const player = game.players.find(val => val.socketId === socket.id)!;
      player.playCardFromHand(card);
      specials.forEach((c: Card) => player.playUsedCard(c));

      // keeping those seperate for now
      // might change to everyone can see everyones points rather than only seeing your own
      game.finishedTurn();

      const playersData = game.getPlayersData();
      let count = 0;
      while (playersData && playersData[0] && count++ < playersData.length) {
        if (playersData[0].socketId) {
          io.to(playersData[0].socketId).emit(SocketEventEnum.PLAYER_STATUS, { playersData } as sEvents.IPlayerStatusProps);
        }
        playersData.push(playersData.shift()!);
      }
    }
  });

  socket.on(SocketEventEnum.HANDLE_SPECIAL_ACTION, ({ roomCode, specialCard, specialData }: sEvents.IHandleSpecialActionProps) => {
    const game = rooms[roomCode];
    if (game && game.players) {
      let player = game.players.find(val => val.socketId === socket.id);
      if (player) {
        game.handleSpecialAction(player, specialCard, specialData);
        game.specialActions.shift();
        socket.to(roomCode).emit(SocketEventEnum.COMPLETED_SPECIAL_ACTION);
        game.finishedTurn();
      }
    }
  });

  // client emit when they continue after game is over
  socket.on(SocketEventEnum.RESET_ROOM, ({ roomCode, playerName }: sEvents.IResetRoomProps) => {
    const game = rooms[roomCode];
    if (!!socketToRoom[socket.id]) {
      if (game.hostPlayer.socketId === socket.id) {
        game.players.unshift(game.hostPlayer);
      } else {
        game.addPlayer(playerName, socket.id, clientIp);
      }
      io.to(roomCode).emit(
        SocketEventEnum.GET_ACTIVE_PLAYERS,
        {
          activePlayers: game.players.map(p => ({
            name: p.name,
            socketId: p.socketId,
          }))
        } as sEvents.IGetActivePlayersProps
      );
      io.to(roomCode).emit(SocketEventEnum.GET_NUMBER_PLAYERS, { numPlayers: game.numPlayers } as sEvents.IGetNumberPlayersProps);
      socket.emit(SocketEventEnum.GAME_INFORMATION, { menu: undefined, roomCode } as sEvents.IGameInformationProps );
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
    // need to remove that player from the display
    let roomCode = socketToRoom[socket.id];
    const game = rooms[roomCode];
    if (game) {
      if (socket.id === game.hostPlayer.socketId) {
        socket.to(roomCode).emit(SocketEventEnum.QUIT_GAME);
        delete rooms[roomCode];
      } else if (game.gameStarted && !game.isGameOver) {
        const index = game.players.findIndex(p => p.socketId === socket.id);
        game.players[index].isAuto = true;
        game.players[index].socketId = '';
        delete socketToRoom[socket.id];
        myConnection.sendLogEntry(roomCode, {player: game.players[index].name, playedCard: "Player Quit"});
      } else {
        game.players = game.players.filter(p => p.socketId !== socket.id);
        socket.to(roomCode).emit(
          SocketEventEnum.GET_ACTIVE_PLAYERS,
          {
            activePlayers: game.players.map(p => ({
              name: p.name,
              socketId: p.socketId,
            }))
          } as sEvents.IGetActivePlayersProps
        );
      } // if
    } // if
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
