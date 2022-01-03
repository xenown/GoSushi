import ICard from './ICard';
import IMenu from './IMenu';
import IPlayer, { IPlayerResult, ISimplePlayer } from './IPlayer'
import { ISpecialLogEntry, TSpecialData } from '../types/ISpecial';

enum SocketEventEnum {
  REJOIN_OPTION = 'rejoinOption',
  REJOIN_GAME = 'rejoinGame',
  REJOIN_GAME_RESULT = 'rejoinGameResult',

  CONNECTION_FAILED = 'connectionFailed',
  
  HOST_GAME = 'hostGame',
  JOIN_GAME = 'joinGame',
  AUTO_PLAYERS = 'autoPlayers',

  GAME_INFORMATION = 'gameInformation',
  GET_ACTIVE_PLAYERS = 'getActivePlayers',
  GET_NUMBER_PLAYERS = 'getNumPlayers',

  GAME_INITIATED = 'gameInitiated',
  START_GAME = 'startGame',
  START_ROUND = 'startRound',
  UPDATE_ROUND_NUMBER = 'updateRoundNumber',
  BOARD_LOADED = 'boardLoaded',
  SEND_PLAYER_RESULT = 'sendPlayerResult',
  SEND_MENU_DATA = 'sendMenuData',
  SEND_TURN_DATA = 'sendTurnData',

  HANDLE_SPECIAL_ACTION = 'handleSpecialAction',
  DO_SPECIAL_ACTION = 'doSpecialAction', 
  WAIT_FOR_ACTION = 'waitForAction',
  COMPLETED_SPECIAL_ACTION = 'completedSpecialAction',
  
  UNKNOWN_GAME = 'unknownGame',
  BROADCAST_SELECTION = 'broadcastSelection',
  FINISH_TURN = 'finishTurn',
  GAME_RESULTS = 'gameResults',

  PLAYER_STATUS = 'playerStatus',
  NEW_LOG_ENTRY = 'newLogEntry',

  RESET_ROOM = 'resetRoom',
  QUIT_GAME = 'quitGame',
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
  roomCode: string;
  sendMenu: boolean;
};

export interface IStartRoundProps {
  roomCode: string;
};

export interface ISendPlayerResultProps {
  result: IPlayerResult;
}

export interface ISendMenuDataProps { menu: IMenu; };
export interface ISendTurnDataProps {
  hand: ICard[];
  players: IPlayer[];
};

export interface IHandleSpecialActionProps {
  roomCode: string;
  specialCard: ICard;
  specialData: TSpecialData[];
};

export interface IDoSpecialActionProps {
  specialCard: ICard;
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
  card: ICard;
  specials: ICard[];
};

export interface IGameResultsProps {
  playersData: IPlayer[];
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
