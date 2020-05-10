import React from 'react';
import _ from 'lodash';
import './menuSelection.css';
import { menuCardImageMap } from '../utils/menuSelectionUtils';

const DisplayMenu = ({ menu }) => {
  return !_.isEmpty(menu) ? (
    <div>
      <h4>Selected Menu</h4>
      <div style={{ fontSize: 'medium' }}>
        <img
          src={require(`../assets/images/MenuImages/${menuCardImageMap['Nigiri']}`)}
          alt="Nigiri"
          key="Nigiri"
        />
        <img
          src={require(`../assets/images/MenuImages/${
            menuCardImageMap[menu.roll]
          }`)}
          alt={menu.roll}
          key={menu.roll}
        />
        {menu.appetizers.map(item => (
          <img
            src={require(`../assets/images/MenuImages/${menuCardImageMap[item]}`)}
            alt={item}
            key={item}
          />
        ))}
        {menu.specials.map(item => (
          <img
            src={require(`../assets/images/MenuImages/${menuCardImageMap[item]}`)}
            alt={item}
            key={item}
          />
        ))}
        <img
          src={require(`../assets/images/MenuImages/${
            menuCardImageMap[menu.dessert]
          }`)}
          alt={menu.dessert}
          key={menu.dessert}
        />
      </div>
    </div>
  ) : null;
};

export default DisplayMenu;
