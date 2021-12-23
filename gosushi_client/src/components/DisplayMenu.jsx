import React from 'react';
import _ from 'lodash';
import './menuSelection.scss';
import { getMenuCardImage } from '../utils/menuSelectionUtils';

const DisplayMenu = ({ menu }) => {
  return !_.isEmpty(menu) ? (
    <div>
      <h4>Selected Menu</h4>
      <div style={{ fontSize: 'medium' }}>
        <img className="game-card" src={getMenuCardImage('Nigiri')} alt="Nigiri" key="Nigiri" />
        {menu.roll !== "" ? <img
          className="game-card" 
          src={getMenuCardImage(menu.roll)}
          alt={menu.roll}
          key={menu.roll}
        /> : null }
        {menu.appetizers.map(item => (
          <img className="game-card" src={getMenuCardImage(item)} alt={item} key={item} />
        ))}
        {menu.specials.map(item => (
          <img className="game-card" src={getMenuCardImage(item)} alt={item} key={item} />
        ))}
        {menu.dessert !== "" ?
        <img
          className="game-card" 
          src={getMenuCardImage(menu.dessert)}
          alt={menu.dessert}
          key={menu.dessert}
        /> : null }
      </div>
    </div>
  ) : null;
};

export default DisplayMenu;
