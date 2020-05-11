import React, { useState } from 'react';
import _ from 'lodash';
import './menuSelection.css';
import {
  rollsEnum,
  appetizersEnum,
  specialsEnum,
  dessertsEnum,
  menuCardImageMap,
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

const MenuSelection = ({ handleMenu, menu }) => {
  const selectRoll = item => { let menucopy = _.clone(menu); menucopy.roll = item; handleMenu(menucopy); }

  const selectAppetizer = item => {
    let menucopy = _.clone(menu);
    let newAppetizer = menu.appetizers.slice();
    if (menu.appetizers.includes(item)) {
      _.remove(newAppetizer, i => i === item);
      menucopy.appetizers = newAppetizer;
    } else if (menu.appetizers.length < 3) {
      newAppetizer.push(item);
      menucopy.appetizers = newAppetizer;
    }
    handleMenu(menucopy);
  };

  const selectSpecial = item => {
    let menucopy = _.clone(menu);
    let newSpecial = menu.specials.slice();
    if (menu.specials.includes(item)) {
      _.remove(newSpecial, i => i === item);
      menucopy.specials = newSpecial;
    } else if (menu.specials.length < 2) {
      newSpecial.push(item);
      menucopy.specials = newSpecial;
    }
    handleMenu(menucopy);
  };

  const selectDessert = item => { let menucopy = _.clone(menu); menucopy.dessert = item; handleMenu(menucopy); }

  const suggestedMenuOnClicks = Object.keys(suggestedMenus).map(name => {
    return () => {
      let menu = {};
      menu.roll = suggestedMenus[name]['roll'];
      menu.appetizers = suggestedMenus[name]['appetizers'];
      menu.specials = suggestedMenus[name]['specials'];
      menu.dessert = suggestedMenus[name]['dessert'];
      handleMenu(menu);
    };
  });

  return (
    <div className="menu-wrapper mt-3 mb-3">
      <div className="pt-1 pb-1 menu-header">Menu</div>
      <div className="row ml-3 mr-3" style={{paddingBottom: '1rem'}}>
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
                      menu.roll === menu.item
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
                      menu.appetizers.includes(item)
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
                      menu.specials.includes(item)
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
                      menu.dessert === item
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
    </div>)
};

export default MenuSelection;
