import { Socket } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { Popover, OverlayTrigger, Button, Badge } from 'react-bootstrap'
import './SpecActionsLog.scss';

interface ISpecialLogEntry {
  chosenCard: string;
  stolenFromPlayer: string;
  player: string;
  playedCard: string;
  boxCards: number;
};

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

    const handleNewLogEntry = (entry: ISpecialLogEntry) => {
      setNumNewEntries(numNewEntries + 1);
      setEntries([processEntry(entry)].concat(entries));
    };

    socket.on('newLogEntry', handleNewLogEntry);

    return () => {
        socket.off('newLogEntry', handleNewLogEntry);
    };
  }, [socket, entries, numNewEntries]);

  const popover = (
    <Popover id="popover-basic" className="spec-actions-log">
      <Popover.Title className="popover-header" as="h3">Special Actions Log</Popover.Title>
      <Popover.Content className="popover-body">
        {(entries.length !== 0)? 
          entries.map((action, index) => (<div className="log-item" key={index}>{action}</div>))
          : <div>No special cards have been played yet.</div>}
      </Popover.Content>
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
            <Badge className="new-entries-circle" variant="light">{numNewEntries}</Badge>
            : null}
    </div>
  );
};

export default SpecActionsLog;
