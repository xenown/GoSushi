import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import SocketEventEnum, * as sEvents from '../types/socketEvents';

interface ICreateRoomProps {
  socket: Socket;
}

const CreateRoom = ({ socket }: ICreateRoomProps) => {
  const history = useHistory();
  const [name, setName] = useState('');

  const onSubmit = () => {
    socket.emit(SocketEventEnum.HOST_GAME, name); // need new socket events
  }

  return (
    <div className="center vertical">
      <div className="form-group">
        <label>Enter your name</label>
        <input
          type="text"
          className="form-control"
          aria-label="Name"
          aria-describedby="inputGroup-sizing-default"
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <button className="btn btn-danger ml-2 mr-2" onClick={() => history.push('/')}>
          Back
        </button>
        <button className="btn btn-success ml-2 mr-2" onClick={onSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default CreateRoom;
