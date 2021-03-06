import React from 'react';
import _ from 'lodash';
import './menuSelection.scss';
import {
  rollsEnum,
  appetizersEnum,
  specialsEnum,
  dessertsEnum,
  invalidMenuOptions,
  menuCardImageMap,
} from '../utils/menuSelectionUtils';
import { suggestedMenus } from '../utils/suggestedMenus';

const SideList = ({ menuList, handleSuggestedMenu }) => (
  <div className="btn-group-vertical">
    {menuList.map((value, index) => (
      <button
        className={
          'btn btn-primary default-menu-btn ' +
          (index % 2 === 0 ? 'odd' : 'even')
        }
        onClick={handleSuggestedMenu[index]}
        key={index}
      >
        {suggestedMenus[value].name}
      </button>
    ))}
  </div>
);

const MenuSelection = ({ handleMenu, menu, numPlayers }) => {
  const validMenuOption = item => invalidMenuOptions[item] ? !invalidMenuOptions[item].includes(numPlayers) : true;
  const getCardStyle = item => "menu-item game-card" + (validMenuOption(item) ? "": " disable-card");

  const selectSingleCourse = (item, course) => {
    let menucopy = _.cloneDeep(menu);
    menucopy[course] = item;
    handleMenu(menucopy);
  };

  const selectMultiCourse = (item, course) => {
    if (!validMenuOption(item)){
      return;
    }

    const maxItems = course === "appetizers" ? 3 : 2;
    let menucopy = _.cloneDeep(menu);
    let newCourse = menu[course].slice();
    if (menu[course].includes(item)) {
      _.remove(newCourse, i => i === item);
      menucopy[course] = newCourse;
    } else if (menu[course].length < maxItems) {
      newCourse.push(item);
      menucopy[course] = newCourse;
    }
    handleMenu(menucopy);
  };

  const suggestedMenuOnClicks = Object.keys(suggestedMenus).map(name => {
    return () => {
      let menu = {};
      menu.roll = suggestedMenus[name]['roll'];
      menu.appetizers = suggestedMenus[name]['appetizers'];
      menu.specials = suggestedMenus[name]['specials'];
      menu.dessert = suggestedMenus[name]['dessert'];
      handleMenu(_.cloneDeep(menu));
    };
  });

  return (
    <div className="menu-wrapper mt-3 mb-3">
      <div className="pt-1 pb-1 menu-header">Menu</div>
      <div className="row ml-3 mr-3" style={{ paddingBottom: '1rem' }}>
        <div className="col-3 menu-left-pane">
          <div className="menu-subheader">Courses</div>
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
                    className={getCardStyle(item) + (menu.roll === item ? " select-roll" : "")}
                    key={item}
                    onClick={() => selectSingleCourse(item, "roll")}
                  />
                ))}
              </div>
              <div
                className="tab-pane menu-items fade"
                id="v-pills-appetizers"
                role="tabpanel"
              >
                {Object.values(appetizersEnum).map(item => (
                  <div key={item} className={getCardStyle(item) + (menu.appetizers.includes(item) ? " select-appetizer": "")}>
                    <img
                      src={menuCardImageMap[item]}
                      alt={item}
                      className="img"
                      onClick={() => selectMultiCourse(item, "appetizers")}
                    />
                    <span className="hovertext">This menu item cannot be chosen when there are {numPlayers} players.</span>
                  </div>
                ))}
              </div>
              <div
                className="tab-pane fade menu-items"
                id="v-pills-specials"
                role="tabpanel"
              >
                {Object.values(specialsEnum).map(item => (
                  <div key={item} className={getCardStyle(item) + (menu.specials.includes(item) ? " select-special": "")}>
                    <img
                      src={menuCardImageMap[item]}
                      alt={item}
                      className="img"
                      onClick={() => selectMultiCourse(item, "specials")}
                    />
                    <span className="hovertext">This menu item cannot be chosen when there are {numPlayers} players.</span>
                  </div>
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
                    className={getCardStyle(item) + (menu.dessert === item ? " select-dessert" : "")}
                    key={item}
                    onClick={() => selectSingleCourse(item, "dessert")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-3 menu-right-pane">
          <div className="menu-subheader">Default Menus</div>
          <SideList
            menuList={Object.keys(suggestedMenus)}
            handleSuggestedMenu={suggestedMenuOnClicks}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuSelection;
