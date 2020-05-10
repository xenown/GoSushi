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
  MENU_SPECIAL_COUNT
} from '../utils/menuSelectionUtils';
import {suggestedMenus} from '../utils/suggestedMenus'


const SideList = props =>
  (
    <div
      className="nav flex-column nav-pills"
      id="v-pills-tab"
      role="tablist"
      aria-orientation="vertical"
    >
      {
        props.list.map((value, index) =>
          (<button
            onClick={props.onclicks[index]}
            key={index}
            >
            {value}
          </button>)
        )
      }
    </div>
  )


const MenuSelection = props => {
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
      msg += `Missing ${diff} appetizer${
        diff > 1 ? 's' : ''
      }.\n`;
    }
    if (specials.length < MENU_SPECIAL_COUNT) {
      let diff = MENU_SPECIAL_COUNT - specials.length;
      msg += `Missing ${diff} special${
        diff > 1 ? 's' : ''
      }.\n`;
    }
    if (dessert === '') {
      msg += 'Missing a dessert.\n';
    }

    if (msg !== '') {
      setMessage(msg);
      return;
    }

    props.handleMenu(menu);
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

  const suggestedMenuOnClicks = Object.keys(suggestedMenus).map((name, index) => {
    return () => {
      setRoll(suggestedMenus[name]['roll']);
      setAppetizers(suggestedMenus[name]['appetizers']);
      setSpecials(suggestedMenus[name]['specials']);
      setDessert(suggestedMenus[name]['dessert']);
    }
  });


  return isDeciding ? (
    <div className="row">
    <div className="col-2 gameformats">
      <SideList list={Object.keys(suggestedMenus)} onclicks={suggestedMenuOnClicks}/>
    </div>
    <div className="col-8">
    <div className="row mt-3 mb-3 menu-selector">
      <div className="col-3 menu-tabs">
        <div
          className="nav flex-column nav-pills"
          id="v-pills-tab"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            className="nav-link active"
            id="v-pills-rolls-tab"
            data-toggle="pill"
            href="#v-pills-rolls"
            role="tab"
          >
            Rolls
          </a>
          <a
            className="nav-link"
            id="v-pills-appetizers-tab"
            data-toggle="pill"
            href="#v-pills-appetizers"
            role="tab"
          >
            Appetizers
          </a>
          <a
            className="nav-link"
            id="v-pills-specials-tab"
            data-toggle="pill"
            href="#v-pills-specials"
            role="tab"
          >
            Specials
          </a>
          <a
            className="nav-link"
            id="v-pills-deserts-tab"
            data-toggle="pill"
            href="#v-pills-deserts"
            role="tab"
          >
            Deserts
          </a>
        </div>
      </div>
      <div className="col-9">
        <div className="menu-items">
          <div className="tab-content" id="v-pills-tabContent">
            <div
              className="tab-pane fade show active"
              id="v-pills-rolls"
              role="tabpanel"
            >
              {Object.values(rollsEnum).map(item => (
                <img
                  src={require(`../assets/images/MenuImages/${menuCardImageMap[item]}`)}
                  alt={item}
                  className="menu-item"
                  key={item}
                  onClick={() => selectRoll(item)}
                  style={
                    roll === item
                      ? { border: '4px solid #741b47', borderRadius: '18px' }
                      : null
                  }
                />
              ))}
            </div>
            <div
              className="tab-pane fade"
              id="v-pills-appetizers"
              role="tabpanel"
            >
              {Object.values(appetizersEnum).map(item => (
                <img
                  src={require(`../assets/images/MenuImages/${menuCardImageMap[item]}`)}
                  alt={item}
                  className="menu-item"
                  key={item}
                  onClick={() => selectAppetizer(item)}
                  style={
                    appetizers.includes(item)
                      ? { border: '4px solid #3c9fa7', borderRadius: '18px' }
                      : null
                  }
                />
              ))}
            </div>
            <div
              className="tab-pane fade"
              id="v-pills-specials"
              role="tabpanel"
            >
              {Object.values(specialsEnum).map(item => (
                <img
                  src={require(`../assets/images/MenuImages/${menuCardImageMap[item]}`)}
                  alt={item}
                  className="menu-item"
                  key={item}
                  onClick={() => selectSpecial(item)}
                  style={
                    specials.includes(item)
                      ? { border: '4px solid #ff9900', borderRadius: '18px' }
                      : null
                  }
                />
              ))}
            </div>
            <div className="tab-pane fade" id="v-pills-deserts" role="tabpanel">
              {Object.values(dessertsEnum).map(item => (
                <img
                  src={require(`../assets/images/MenuImages/${menuCardImageMap[item]}`)}
                  alt={item}
                  className="menu-item"
                  key={item}
                  onClick={() => selectDessert(item)}
                  style={
                    dessert === item
                      ? { border: '4px solid #b90064', borderRadius: '18px' }
                      : null
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        className="submit-menu btn btn-primary mt-3 mb-2"
        onClick={handleSubmit}
      >
        Submit Menu
      </button>
      <div className="col-12">{message}</div>
    </div>
    </div>
    <div className="col-2 gameformats">
      {/* <SideList list={["Test1" , "Test2"]}/> */}
    </div>
    </div>
  ) : null;
};

export default MenuSelection;
