import { Socket } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { Popover, OverlayTrigger, Button, Badge } from 'react-bootstrap';
import './SpecActionsLog.scss';
import { ISpecialLogEntry } from '../types/ISpecial';
import SocketEventEnum, { INewLogEntryProps } from '../types/socketEvents';

interface ISpecActionsLogProps {
  socket: Socket;
};

const SpecActionsLog = ({ socket }: ISpecActionsLogProps) => {
  const [entries, setEntries] = useState<JSX.Element[]>([]);
  const [numNewEntries, setNumNewEntries] = useState(0);

  useEffect(() => {
    const processEntry = (entry: ISpecialLogEntry) => {
      let details = null;
      const plCardCN = 'log-' + entry.playedCard.replace(/\s/g, '').toLowerCase();
      const cCardCN = (entry.chosenCard)? 'log-' + entry.chosenCard.replace(/\s/g, '').toLowerCase() : undefined;
      switch (entry.playedCard) {
        case 'Chopsticks':
          details = <span>, taking an extra <b className={cCardCN}>{entry.chosenCard}</b> from their hand.</span> 
          break;
        case 'Menu':
          details = <span>, ordering <b className={cCardCN}>{entry.chosenCard}</b> from the deck.</span> 
          break;
        case 'Special Order':
          details = <span>, duplicating their <b className={cCardCN}>{entry.chosenCard}</b>.</span> 
          break;
        case 'Spoon':
          if (entry.stolenFromPlayer) {
            details = <span>, stealing a(n) <b className={cCardCN}>{entry.chosenCard}</b> from <b>{entry.stolenFromPlayer}</b>'s hand.</span> 
          } else {
            details = <span>, but found no player holding the requested <b className={cCardCN}>{entry.chosenCard}</b>.</span>
          }
          break;
        case 'Takeout Box':
            details = <span>, boxing <b>{entry.boxCards}</b> item(s) from their hand. </span>
          break;
        case 'Player Quit':
          return <span><b>{entry.player}</b> has quit.</span>
        case 'Player Reconnect':
          return <span><b>{entry.player}</b> has reconnected.</span>
        default:
      }
      return <span>
        <b>{entry.player}</b> played <b className={plCardCN}>{entry.playedCard}</b>{details}
      </span>
    }; // processEntry

    const handleNewLogEntry = (entry: INewLogEntryProps) => {
      setNumNewEntries(numNewEntries + 1);
      setEntries([processEntry(entry)].concat(entries));
    };

    socket.on(SocketEventEnum.NEW_LOG_ENTRY, handleNewLogEntry);

    return () => {
        socket.off(SocketEventEnum.NEW_LOG_ENTRY, handleNewLogEntry);
    };
  }, [socket, entries, numNewEntries]);

  const popover = (
    <Popover id="popover-basic" className="spec-actions-log">
      <Popover.Header className="popover-header" as="h3">Special Actions Log</Popover.Header>
      <Popover.Body className="popover-body">
        {(entries.length !== 0)? 
          entries.map((action, index) => (<div className="log-item" key={index}>{action}</div>))
          : <div>No special cards have been played yet.</div>}
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="spec-actions-log-container">
        <OverlayTrigger trigger="click" placement="left-start" rootClose={true} overlay={popover}>
            <Button className="spec-actions-log-button" variant="success" onClick = {() => {setNumNewEntries(0)}}> 
                Log
            </Button>
        </OverlayTrigger>
        {numNewEntries !== 0? 
            <Badge className="new-entries-circle" bg="alert">{numNewEntries}</Badge>
            : null}
    </div>
  );
};

export default SpecActionsLog;
