import React, { useState } from 'react';
import _ from 'lodash';
import './menuSelection.css';
import {
  rollsEnum,
  appetizersEnum,
  specialsEnum,
  dessertsEnum,
  menuCardImageMap,
  MENU_APPETIZER_COUNT,
  MENU_SPECIAL_COUNT,
} from '../utils/menuSelectionUtils';
import { suggestedMenus } from '../utils/suggestedMenus';

const SideList = ({ menuList, handleSuggestedMenu }) => (
  <div className="btn-group-vertical">
    {menuList.map((value, index) => (
      <button className={"btn btn-primary default-menu-btn " + (index%2==0? "odd" : 'even')} onClick={handleSuggestedMenu[index]} key={index}>
        {suggestedMenus[value].name}
      </button>
    ))}
  </div>
);

const MenuSelection = ({ handleMenu }) => {
  const [roll, setRoll] = useState('');
  const [appetizers, setAppetizers] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [dessert, setDessert] = useState('');
  const [isDeciding, setIsDeciding] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const menu = {
      roll: roll,
      appetizers: appetizers,
      specials: specials,
      dessert: dessert,
    };

    let msg = '';
    if (roll === '') {
      msg += 'Missing a roll.\n';
    }
    if (appetizers.length < MENU_APPETIZER_COUNT) {
      let diff = MENU_APPETIZER_COUNT - appetizers.length;
      msg += `Missing ${diff} appetizer${diff > 1 ? 's' : ''}.\n`;
    }
    if (specials.length < MENU_SPECIAL_COUNT) {
      let diff = MENU_SPECIAL_COUNT - specials.length;
      msg += `Missing ${diff} special${diff > 1 ? 's' : ''}.\n`;
    }
    if (dessert === '') {
      msg += 'Missing a dessert.\n';
    }

    if (msg !== '') {
      setMessage(msg);
      return;
    }

    handleMenu(menu);
    setIsDeciding(false);
  };

  const selectRoll = item => setRoll(item);

  const selectAppetizer = item => {
    let newAppetizer = appetizers.slice();
    if (appetizers.includes(item)) {
      _.remove(newAppetizer, i => i === item);
      setAppetizers(newAppetizer);
    } else if (appetizers.length < 3) {
      newAppetizer.push(item);
      setAppetizers(newAppetizer);
    }
  };

  const selectSpecial = item => {
    let newSpecial = specials.slice();
    if (specials.includes(item)) {
      _.remove(newSpecial, i => i === item);
      setSpecials(newSpecial);
    } else if (specials.length < 2) {
      newSpecial.push(item);
      setSpecials(newSpecial);
    }
  };

  const selectDessert = item => setDessert(item);

  const suggestedMenuOnClicks = Object.keys(suggestedMenus).map(name => {
    return () => {
      setRoll(suggestedMenus[name]['roll']);
      setAppetizers(suggestedMenus[name]['appetizers']);
      setSpecials(suggestedMenus[name]['specials']);
      setDessert(suggestedMenus[name]['dessert']);
    };
  });

  return isDeciding ? (
    <div className="menu-wrapper mt-3 mb-3">
      <div className="pt-1 pb-1 menu-header">Menu</div>
      <div className="row ml-3 mr-3">
        <div className="col-3 menu-left-pane">
          <div className='menu-subheader'>Courses</div>
          <div
            className="nav flex-column nav-pills"
            id="v-pills-tab"
            role="tablist"
          >
            <a
              className="nav-link course-tab active"
              id="v-pills-rolls-tab"
              data-toggle="pill"
              href="#v-pills-rolls"
              role="tab"
            >
              Rolls
            </a>
            <a
              className="nav-link course-tab"
              id="v-pills-appetizers-tab"
              data-toggle="pill"
              href="#v-pills-appetizers"
              role="tab"
            >
              Appetizers
            </a>
            <a
              className="nav-link course-tab"
              id="v-pills-specials-tab"
              data-toggle="pill"
              href="#v-pills-specials"
              role="tab"
            >
              Specials
            </a>
            <a
              className="nav-link course-tab"
              id="v-pills-desserts-tab"
              data-toggle="pill"
              href="#v-pills-desserts"
              role="tab"
            >
              Desserts
            </a>
          </div>
        </div>
        <div className="col-6">
          <div className="menu-center-pane">
            <div className="tab-content" id="v-pills-tabContent">
              <div
                className="tab-pane fade show menu-items active"
                id="v-pills-rolls"
                role="tabpanel"
              >
                {Object.values(rollsEnum).map(item => (
                  <img
                    src={menuCardImageMap[item]}
                    alt={item}
                    className="menu-item"
                    key={item}
                    onClick={() => selectRoll(item)}
                    style={
                      roll === item
                        ? {
                            border: '4px solid #741b47',
                            borderRadius: '18px',
                          }
                        : null
                    }
                  />
                ))}
              </div>
              <div
                className="tab-pane menu-items fade"
                id="v-pills-appetizers"
                role="tabpanel"
              >
                {Object.values(appetizersEnum).map(item => (
                  <img
                    src={menuCardImageMap[item]}
                    alt={item}
                    className="menu-item"
                    key={item}
                    onClick={() => selectAppetizer(item)}
                    style={
                      appetizers.includes(item)
                        ? {
                            border: '4px solid #3c9fa7',
                            borderRadius: '18px',
                          }
                        : null
                    }
                  />
                ))}
              </div>
              <div
                className="tab-pane fade menu-items"
                id="v-pills-specials"
                role="tabpanel"
              >
                {Object.values(specialsEnum).map(item => (
                  <img
                    src={menuCardImageMap[item]}
                    alt={item}
                    className="menu-item"
                    key={item}
                    onClick={() => selectSpecial(item)}
                    style={
                      specials.includes(item)
                        ? {
                            border: '4px solid #ff9900',
                            borderRadius: '18px',
                          }
                        : null
                    }
                  />
                ))}
              </div>
              <div
                className="tab-pane fade menu-items"
                id="v-pills-desserts"
                role="tabpanel"
              >
                {Object.values(dessertsEnum).map(item => (
                  <img
                    src={menuCardImageMap[item]}
                    alt={item}
                    className="menu-item"
                    key={item}
                    onClick={() => selectDessert(item)}
                    style={
                      dessert === item
                        ? {
                            border: '4px solid #b90064',
                            borderRadius: '18px',
                          }
                        : null
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-3 menu-right-pane">
          <div className='menu-subheader'>Default Menus</div>
          <SideList
            menuList={Object.keys(suggestedMenus)}
            handleSuggestedMenu={suggestedMenuOnClicks}
          />
        </div>
      </div>
      <div className="mt-2">{message}</div>
      <button
        className="submit-menu btn btn-primary mt-2 mb-3"
        onClick={handleSubmit}
      >
        Submit Menu
      </button>     
    </div>
  ) : null;
};

export default MenuSelection;
