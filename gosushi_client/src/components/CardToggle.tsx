import React from 'react';

import { Desserts, Sushi } from '../utils/toggleImages';

import './cardToggle.scss';

interface ICardToggleProps {
  checked: boolean;
  onClick: () => void;
}

const CardToggle = ({ checked, onClick }: ICardToggleProps) => {
  const toggleImage = checked ? Sushi : Desserts;
  const altToggleImageText = checked ? 'Sushi' : 'Desserts';

  return (
    <label className="switch">
      <div className={'slider' + (checked ? ' checked' : '')}>
        <input type="checkbox" checked={checked} onChange={onClick} />
        <div className="slider-icon center">
          <img
            className="toggle-image"
            src={toggleImage}
            alt={altToggleImageText}
          />
        </div>
      </div>
    </label>
  );
};

export default CardToggle;
