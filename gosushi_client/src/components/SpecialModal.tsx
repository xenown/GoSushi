import { Socket } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Modal } from 'react-bootstrap';

import { MenuCardNameEnum } from '../types/cardNameEnum';
import ICard from '../types/ICard';
import IRouteParams from '../types/IRouteParams';
import { TSpecialData } from '../types/ISpecial';
import { getMenuCardImage } from '../utils/menuSelectionUtils';
import { getCardImage } from '../utils/getCardImage';
import './specialModal.scss';
import SocketEventEnum, { IDoSpecialActionProps, IHandleSpecialActionProps, IWaitForSpecialActionProps } from '../types/socketEvents';

interface ISpecialModalProps {
  socket: Socket;
};

const SpecialModal = ({ socket }: ISpecialModalProps) => {
  const params: IRouteParams = useParams();
  const [specialCard, setSpecialCard] = useState<ICard | undefined>(undefined);
  const [specialData, setSpecialData] = useState<TSpecialData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [alertText, setAlertText] = useState('');

  useEffect(() => {
    const handleSpecialAction = ({ specialCard: card, specialData: data}: IDoSpecialActionProps) => {
      setSpecialCard(card);
      setSpecialData(data);
    };

    const handleWaitingForAction = ({ playerName, cardName }: IWaitForSpecialActionProps) => {
      setAlertText(`Waiting for ${playerName} to finish ${cardName} actions.`);
    };

    const handleCompleteAction = () => {
      setSpecialCard(undefined);
      setSpecialData([]);
      setAlertText('');
    };

    socket.on(SocketEventEnum.DO_SPECIAL_ACTION, handleSpecialAction);
    socket.on(SocketEventEnum.WAIT_FOR_ACTION, handleWaitingForAction);
    socket.on(SocketEventEnum.COMPLETED_SPECIAL_ACTION, handleCompleteAction);

    return () => {
      socket.off(SocketEventEnum.DO_SPECIAL_ACTION, handleSpecialAction);
      socket.off(SocketEventEnum.WAIT_FOR_ACTION, handleWaitingForAction);
      socket.off(SocketEventEnum.COMPLETED_SPECIAL_ACTION, handleCompleteAction);
    };
  }, [params.roomCode, socket]);

  const handleFinish = () => {
    let selectedSpecialData: TSpecialData[] = [];
    specialData.forEach((card, index) => {
      if (selectedIndices.includes(index)) {
        selectedSpecialData.push(card);
      }
    });
    socket.emit(
      SocketEventEnum.HANDLE_SPECIAL_ACTION,
      { roomCode: params.roomCode, specialCard, specialData: selectedSpecialData } as IHandleSpecialActionProps
    );
    setSpecialCard(undefined);
    setSpecialData([]);
    setSelectedIndices([]);
    setAlertText('');
  };

  const bodyContent = () => {
    if (specialData.length > 0) {
      return specialData.map(displayCard);
    } else if (specialCard && specialData.length === 0) {
      return (
        <Alert variant="info">{'No cards available to choose from'}</Alert>
      );
    }
  };

  const displayCard = (card: TSpecialData, index: number) => {
    const castedCard = card as ICard;
    const isCard: boolean = !!(castedCard?.name);

    let className = 'card-playable-special';

    if (selectedIndices.includes(index)) {
      className += ' card-selected';
    }

    return (
      <div
        className={className}
        key={`cards-for-special-action-${index}`}
        onClick={() => {
          if (specialCard?.name === 'Menu' && isCard && castedCard.name === 'Menu') {
            setAlertText('You cannot choose a menu card');
          } else if (specialCard?.name === 'Takeout Box') {
            setSelectedIndices(
              selectedIndices.includes(index)
                ? selectedIndices.filter(val => val !== index)
                : selectedIndices.concat([index])
            );
          } else {
            setSelectedIndices([index]);
            setAlertText('');
          }
        }}
      >
        <img
          className="card-special"
          src={isCard ? getCardImage(castedCard) : getMenuCardImage(card as MenuCardNameEnum)}
          alt={isCard ? castedCard.name : card as MenuCardNameEnum}
          key={`card-image-${card}-${index}`}
        />
      </div>
    );
  };

  const modalTitle = !!specialCard
    ? `${specialCard.name} Actions`
    : 'Waiting for others';

  const disableFinish =
    specialData.length > 0 &&
    selectedIndices.length === 0 &&
    specialCard?.name !== 'Takeout Box';

  return (
    <Modal
      show={!!specialCard || !!alertText}
      onHide={() => {
        setSelectedIndices([]);
        setAlertText('');
      }}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="body-special-modal">{bodyContent()}</div>
        {alertText !== '' && <Alert variant="info">{alertText}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        {!!specialCard && (
          <Button
            variant="primary"
            disabled={disableFinish}
            onClick={handleFinish}
          >
            Finish
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SpecialModal;
