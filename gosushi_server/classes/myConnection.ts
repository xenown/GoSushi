import { Server } from 'socket.io';
import Card from './card';
import Player from './player';
import IPlayer from '../types/IPlayer'
import { ISpecialLogEntry, TSpecialData } from '../types/ISpecialAction';
import SocketEventEnum, * as sEvents from '../types/socketEvents';

export interface IConnection {
  sendTurnData: (socketId: string, hand: Card[], otherPlayerData: IPlayer[]) => void;
  doSpecialAction: (playerName: string, players: Player[], specialCard: Card, data: TSpecialData[]) => void;
  updateRound: (roomCode: string, roundNumber: number) => void;
  sendGameResults: (socketId: string, playersData: IPlayer[], isHost: boolean) => void;
  sendLogEntry: (roomCode: string, entry: ISpecialLogEntry) => void;
};

class MyConnection implements IConnection {
  ioServer: Server;

  constructor (io: Server) {
    this.ioServer = io;
  } // constructor

  sendTurnData (socketId: string, hand: Card[], otherPlayerData: IPlayer[]) {
    this.ioServer.to(socketId).emit(SocketEventEnum.SEND_TURN_DATA, { hand, players: otherPlayerData } as sEvents.ISendTurnDataProps);
  } // sendTurnData

  doSpecialAction (playerName: string, players: Player[], specialCard: Card, data: TSpecialData[]) {
    players.forEach(p => {
      if (p.name === playerName) {
        this.ioServer.to(p.socketId).emit(SocketEventEnum.DO_SPECIAL_ACTION, { specialCard, specialData: data } as sEvents.IDoSpecialActionProps);
      } else {
        this.ioServer.to(p.socketId).emit(SocketEventEnum.WAIT_FOR_ACTION, { playerName, cardName: specialCard.name } as sEvents.IWaitForSpecialActionProps);
      }
    });
  } // doSpecialAction

  updateRound (roomCode: string, roundNumber: number) {
    this.ioServer.to(roomCode).emit(SocketEventEnum.UPDATE_ROUND_NUMBER, { roundNumber } as sEvents.IUpdateRoundNumberProps);
  } // updateRound

  sendGameResults (socketId: string, playersData: IPlayer[], isHost: boolean) {
    this.ioServer.to(socketId).emit(SocketEventEnum.GAME_RESULTS, { playersData, isHost } as sEvents.IGameResultsProps);
  } // sendGameResults

  sendLogEntry (roomCode: string, entry: ISpecialLogEntry) {
    this.ioServer.to(roomCode).emit(SocketEventEnum.NEW_LOG_ENTRY, entry as sEvents.INewLogEntryProps);
  } // sendLogEntry
} // MyConnection

export class MockConnection implements IConnection {
  sendTurnData (socketId: string, hand: Card[], otherPlayerData: IPlayer[]) {}
  doSpecialAction (playerName: string, players: Player[], specialCard: Card, data: TSpecialData[]) {}
  updateRound (roomCode: string, roundNumber: number) {}
  sendGameResults (socketId: string, playersData: IPlayer[], isHost: boolean) {}
  sendLogEntry (roomCode: string, entry: ISpecialLogEntry) {}
}

export default MyConnection;
