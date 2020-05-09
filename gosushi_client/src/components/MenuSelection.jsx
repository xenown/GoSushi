import React, { useState } from 'react';
import _ from 'lodash';
import './menuSelection.css';

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
    if (appetizers.length < 3) {
      msg += `Missing ${3 - appetizers.length} appetizer${
        appetizers.length < 2 ? 's' : ''
      }.\n`;
    }
    if (specials.length < 2) {
      msg += `Missing ${2 - specials.length} special${
        specials.length === 0 ? 's' : ''
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

  if (isDeciding) {
    return (
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
                  <button
                    className="menu-item"
                    key={item}
                    onClick={() => selectRoll(item)}
                    style={
                      roll === item ? { backgroundColor: '#741b47' } : null
                    }
                  >
                    {' '}
                    {item}
                  </button>
                ))}
              </div>
              <div
                className="tab-pane fade"
                id="v-pills-appetizers"
                role="tabpanel"
              >
                {Object.values(appetizersEnum).map(item => (
                  <button
                    className="menu-item"
                    key={item}
                    onClick={() => selectAppetizer(item)}
                    style={
                      appetizers.includes(item)
                        ? { backgroundColor: '#3c9fa7' }
                        : null
                    }
                  >
                    {' '}
                    {item}
                  </button>
                ))}
              </div>
              <div
                className="tab-pane fade"
                id="v-pills-specials"
                role="tabpanel"
              >
                {Object.values(specialsEnum).map(item => (
                  <button
                    className="menu-item"
                    key={item}
                    onClick={() => selectSpecial(item)}
                    style={
                      specials.includes(item)
                        ? { backgroundColor: '#ff9900' }
                        : null
                    }
                  >
                    {' '}
                    {item}
                  </button>
                ))}
              </div>
              <div
                className="tab-pane fade"
                id="v-pills-deserts"
                role="tabpanel"
              >
                {Object.values(dessertsEnum).map(item => (
                  <button
                    className="menu-item"
                    key={item}
                    onClick={() => selectDessert(item)}
                    style={
                      dessert === item ? { backgroundColor: '#b90064' } : null
                    }
                  >
                    {' '}
                    {item}
                  </button>
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
    );
  } else {
    return (
      <div>
        <h4>Selected Menu</h4>
        <div style={{ fontSize: 'medium' }}>
          <div>Nigiri</div>
          <div>{roll}</div>
          {appetizers.map((item, index) => (
            <div key={'appetizer' + index}>{item}</div>
          ))}
          {specials.map((item, index) => (
            <div key={'specials' + index}>{item}</div>
          ))}
          <div>{dessert}</div>
        </div>
      </div>
    );
  }
};

export default MenuSelection;

const rollsEnum = Object.freeze({
  MAKI: 'Maki',
  TEMAKI: 'Temaki',
  URAMAKI: 'Uramaki',
});

const appetizersEnum = Object.freeze({
  DUMPLING: 'Dumpling',
  EDAMAME: 'Edamame',
  EEL: 'Eel',
  ONIGIRI: 'Onigiri',
  MISO_SOUP: 'Miso Soup',
  SASHIMI: 'Sashimi',
  TEMPURA: 'Tempura',
  TOFU: 'Tofu',
});

const specialsEnum = Object.freeze({
  CHOPSTICKS: 'Chopsticks',
  SPOON: 'Spoon',
  MENU: 'Menu',
  TAKEOUT_BOX: 'Takeout Box',
  SOY_SAUCE: 'Soy Sauce',
  TEA: 'Tea',
  WASABI: 'Wasabi',
  SPECIAL_ORDER: 'Special Order',
});

const dessertsEnum = Object.freeze({
  PUDDING: 'Pudding',
  GREEN_TEA_ICE_CREAM: 'Green Tea Ice Cream',
  FRUIT: 'Fruit',
});
