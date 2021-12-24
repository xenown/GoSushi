import { cloneDeep, remove } from 'lodash';
import React from 'react';
import './menuSelection.scss';
import {
  MenuCardNameEnum,
  RollsEnum,
  AppetizersEnum,
  SpecialsEnum,
  DessertsEnum,
} from '../types/cardNameEnum';
import IMenu, { CourseEnum, IOptionalMenu } from '../types/IMenu';
import {
  getMenuCardImage,
  invalidMenuOptions,
  MENU_APPETIZER_COUNT,
  MENU_SPECIAL_COUNT,
} from '../utils/menuSelectionUtils';
import { suggestedMenus } from '../utils/suggestedMenus';

interface ISideListProps {
  menuList: CourseEnum[];
  handleSuggestedMenu: (() => void)[];
}

const SideList = ({ menuList, handleSuggestedMenu }: ISideListProps) => (
  <div className="btn-group-vertical">
    {menuList.map((value: CourseEnum, index) => (
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

interface IMenuSelectionProps {
  handleMenu: (menu: IOptionalMenu) => void;
  menu: IOptionalMenu;
  numPlayers: number;
}

const MenuSelection = ({ handleMenu, menu, numPlayers }: IMenuSelectionProps) => {
  const validMenuOption = (item: MenuCardNameEnum) => invalidMenuOptions[item] ? !invalidMenuOptions[item].includes(numPlayers) : true;
  const getCardStyle = (item: MenuCardNameEnum) => "menu-item game-card" + (validMenuOption(item) ? "": " disable-card");

  const selectSingleCourse = (item: RollsEnum | DessertsEnum, course: CourseEnum.ROLL | CourseEnum.DESSERT) => {
    let menucopy = cloneDeep(menu);
    switch (course) {
      case CourseEnum.ROLL:
        menucopy.roll = item as RollsEnum;
        break;
      case CourseEnum.DESSERT:
        menucopy.dessert = item as DessertsEnum;
        break;
      default:
        console.log(`Error: invalid`);
        break;
    }
    handleMenu(menucopy);
  };

  const selectMultiCourse = (item: MenuCardNameEnum, course: CourseEnum.APPETIZERS | CourseEnum.SPECIALS) => {
    // selected menu item must satisfy player number limitations
    if (!validMenuOption(item)) {
      return;
    } // if

    const setMultiCourse = (menu: IOptionalMenu, items: MenuCardNameEnum[]) => {
      switch (course) {
        case CourseEnum.APPETIZERS:
          menu.appetizers = items as AppetizersEnum[];
          break;
        case CourseEnum.SPECIALS:
          menu.specials = items as SpecialsEnum[];
          break;
        default:
          console.log(`Error: invalid`);
          break;
      } // switch
    } // setMultiCourse

    const maxItems = course === "appetizers" ? MENU_APPETIZER_COUNT : MENU_SPECIAL_COUNT;

    const parseMultiMenuItems = (menucopy: IOptionalMenu, items: MenuCardNameEnum[], item: MenuCardNameEnum): void => {
      if (items.includes(item)) {
        remove(items, i => i === item);
        setMultiCourse(menucopy, items);
      } else if (items.length < maxItems) {
        items.push(item);
        setMultiCourse(menucopy, items);
      } // if
    } // parseMultiMenuItems

    let menucopy = cloneDeep(menu);
    parseMultiMenuItems(menucopy, menu[course].slice(), item);
    handleMenu(menucopy);
  };

  const suggestedMenuOnClicks = Object.keys(suggestedMenus).map(name => {
    return () => {
      let menu: IMenu = {
        roll: suggestedMenus[name].roll,
        appetizers: suggestedMenus[name].appetizers,
        specials: suggestedMenus[name].specials,
        dessert: suggestedMenus[name].dessert,
      };
      handleMenu(cloneDeep(menu));
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
                {Object.values(RollsEnum).map(item => (
                  <img
                    src={getMenuCardImage(item)}
                    alt={item}
                    className={getCardStyle(item) + (menu.roll === item ? " select-roll" : "")}
                    key={item}
                    onClick={() => selectSingleCourse(item, CourseEnum.ROLL)}
                  />
                ))}
              </div>
              <div
                className="tab-pane menu-items fade"
                id="v-pills-appetizers"
                role="tabpanel"
              >
                {Object.values(AppetizersEnum).map(item => (
                  <div key={item} className={getCardStyle(item) + (menu.appetizers.includes(item) ? " select-appetizer": "")}>
                    <img
                      src={getMenuCardImage(item)}
                      alt={item}
                      className="img"
                      onClick={() => selectMultiCourse(item, CourseEnum.APPETIZERS)}
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
                {Object.values(SpecialsEnum).map(item => (
                  <div key={item} className={getCardStyle(item) + (menu.specials.includes(item) ? " select-special": "")}>
                    <img
                      src={getMenuCardImage(item)}
                      alt={item}
                      className="img"
                      onClick={() => selectMultiCourse(item, CourseEnum.SPECIALS)}
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
                {Object.values(DessertsEnum).map(item => (
                  <img
                    src={getMenuCardImage(item)}
                    alt={item}
                    className={getCardStyle(item) + (menu.dessert === item ? " select-dessert" : "")}
                    key={item}
                    onClick={() => selectSingleCourse(item, CourseEnum.DESSERT)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-3 menu-right-pane">
          <div className="menu-subheader">Default Menus</div>
          <SideList
            menuList={Object.keys(suggestedMenus) as CourseEnum[]}
            handleSuggestedMenu={suggestedMenuOnClicks}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuSelection;
