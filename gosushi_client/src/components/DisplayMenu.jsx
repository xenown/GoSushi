import React from 'react';
import _ from 'lodash';
import './menuSelection.css';
import { menuCardImageMap } from '../utils/menuSelectionUtils';

const DisplayMenu = ({ menu }) => {
  return !_.isEmpty(menu) ? (
    <div>
      <h4>Selected Menu</h4>
      <div style={{ fontSize: 'medium' }}>
        <img src={menuCardImageMap['Nigiri']} alt="Nigiri" key="Nigiri" />
        {menu.roll !== "" ? <img
          src={menuCardImageMap[menu.roll]}
          alt={menu.roll}
          key={menu.roll}
        /> : null }
        {menu.appetizers.map(item => (
          <img src={menuCardImageMap[item]} alt={item} key={item} />
        ))}
        {menu.specials.map(item => (
          <img src={menuCardImageMap[item]} alt={item} key={item} />
        ))}
        {menu.dessert !== "" ?
        <img
          src={menuCardImageMap[menu.dessert]}
          alt={menu.dessert}
          key={menu.dessert}
        /> : null }
      </div>
    </div>
  ) : null;
};

export default DisplayMenu;
