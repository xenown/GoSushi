import Card from '../classes/card';
import IMenu from "./IMenu";
import IPlayer, { ISimplePlayer } from './IPlayer'
import { ISpecialLogEntry, TSpecialData } from '../types/ISpecialAction';

enum SocketEventEnum {
  REJOIN_OPTION = 'rejoinOption',                       // emit
  REJOIN_GAME = 'rejoinGame',                           // on
  REJOIN_GAME_RESULT = 'rejoinGameResult',              // emit

  CONNECTION_FAILED = 'connectionFailed',               // emit

  HOST_GAME = 'hostGame',                               // on
  JOIN_GAME = 'joinGame',                               // on
  AUTO_PLAYERS = 'autoPlayers',                         // on

  GAME_INFORMATION = 'gameInformation',                 // emit
  GET_ACTIVE_PLAYERS = 'getActivePlayers',              // emit
  GET_NUMBER_PLAYERS = 'getNumPlayers',                 // emit

  GAME_INITIATED = 'gameInitiated',                     // on
  START_GAME = 'startGame',                             // emit
  UPDATE_ROUND_NUMBER = 'updateRoundNumber',            // emit
  BOARD_LOADED = 'boardLoaded',                         // on
  SEND_MENU_DATA = 'sendMenuData',                      // emit
  SEND_TURN_DATA = 'sendTurnData',                      // emit

  HANDLE_SPECIAL_ACTION = 'handleSpecialAction',        // on
  DO_SPECIAL_ACTION = 'doSpecialAction',                // emit
  WAIT_FOR_ACTION = 'waitForAction',                    // emit
  COMPLETED_SPECIAL_ACTION = 'completedSpecialAction',  // emit
  
  UNKNOWN_GAME = 'unknownGame',                         // emit
  BROADCAST_SELECTION = 'broadcastSelection',           // on
  FINISH_TURN = 'finishTurn',                           // on
  GAME_RESULTS = 'gameResults',                          // emit

  PLAYER_STATUS = 'playerStatus',                       // emit
  NEW_LOG_ENTRY = 'newLogEntry',                        // emit

  RESET_ROOM = 'resetRoom',                             // on
  QUIT_GAME = 'quitGame',                               // emit
};

export interface IRejoinOptionProps { rooms: string[] };
export interface IRejoinGameProps { roomCode: string; };
export interface IRejoinGameResultProps { roomCode?: string; };

export interface IConnectionFailedProps { error: string; };

export interface IHostGameProps {
  menu: IMenu;
  numPlayers: number;
  username: string;
};

export interface IJoinGameProps {
  username: string;
  roomCode: string;
};

export interface IAutoPlayersProps { 
  menu: IMenu;
  numPlayers: number;
  username: string;
};

export interface IGameInformationProps {
  menu?: IMenu; // need to figure out how to properly handle incomplete/missing menu
  roomCode: string;
};

export interface IGetActivePlayersProps { activePlayers: ISimplePlayer[]; };
export interface IGetNumberPlayersProps { numPlayers: number; };
export interface IGameInitiatedProps { roomCode: string; };
export interface IStartGameProps { roomCode: string; };
export interface IUpdateRoundNumberProps { roundNumber: number };
export interface IBoardLoadedProps {
  roomCode: string,
  sendMenu: boolean,
};
export interface ISendMenuDataProps { menu: IMenu; };
export interface ISendTurnDataProps {
  hand: Card[];
  players: IPlayer[];
};

export interface IHandleSpecialActionProps {
  roomCode: string;
  specialCard: Card;
  specialData: TSpecialData[];
};

export interface IDoSpecialActionProps {
  specialCard: Card;
  specialData: TSpecialData[];
};

export interface IWaitForSpecialActionProps {
  playerName: string;
  cardName: string;
};

export interface ICompletedSpecialActionProps {};

export interface IUnknownGameProps {};

export interface IBroadcastSelectionProps {
  menu: IMenu;
  numPlayers: number;
  roomCode: string;
};

export interface IFinishTurnProps {
  roomCode: string;
  card: Card;
  specials: Card[];
};

export interface IGameResultsProps {
  playersData: IPlayer[];
  isHost: boolean;
};

export interface IPlayerStatusProps {
  playersData: IPlayer[];
};

export interface INewLogEntryProps extends ISpecialLogEntry {};

export interface IResetRoomProps {
  roomCode: string;
  playerName: string;
};

export interface IQuitGameProps {};

export default SocketEventEnum;
