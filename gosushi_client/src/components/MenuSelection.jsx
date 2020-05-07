import React, { useState } from 'react';
import _ from 'lodash';

const MenuSelection = props => {
  const [tab, setTab] = useState(tabsEnum.ROLL);
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

  const switchTab = tabName => setTab(tabName);

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

  const getTab = () => {
    switch (tab) {
      case tabsEnum.ROLL:
        return (
          <div style={{ display: 'block' }}>
            {Object.values(rollsEnum).map(item => (
              <button
                key={item}
                onClick={() => selectRoll(item)}
                style={roll === item ? { backgroundColor: '#741b47' } : null}
              >
                {item}
              </button>
            ))}
          </div>
        );
      case tabsEnum.APPETIZER:
        return (
          <div style={{ display: 'block' }}>
            {Object.values(appetizersEnum).map(item => (
              <button
                key={item}
                onClick={() => selectAppetizer(item)}
                style={
                  appetizers.includes(item)
                    ? { backgroundColor: '#3c9fa7' }
                    : null
                }
              >
                {item}
              </button>
            ))}
          </div>
        );
      case tabsEnum.SPECIAL:
        return (
          <div style={{ display: 'block' }}>
            {Object.values(specialsEnum).map(item => (
              <button
                key={item}
                onClick={() => selectSpecial(item)}
                style={
                  specials.includes(item)
                    ? { backgroundColor: '#ff9900' }
                    : null
                }
              >
                {item}
              </button>
            ))}
          </div>
        );
      case tabsEnum.DESSERT:
        return (
          <div style={{ display: 'block' }}>
            {Object.values(dessertsEnum).map(item => (
              <button
                key={item}
                onClick={() => selectDessert(item)}
                style={dessert === item ? { backgroundColor: '#b90064' } : null}
              >
                {item}
              </button>
            ))}
          </div>
        );
      default:
        return <div style={{ display: 'block' }}>Invalid tab name.</div>;
    }
  };

  if (isDeciding) {
    return (
      <div>
        <p>{message}</p>
        {getTab()}
        <div>
          <button onClick={() => switchTab(tabsEnum.ROLL)}>Rolls</button>
          <button onClick={() => switchTab(tabsEnum.APPETIZER)}>
            Appetizers
          </button>
          <button onClick={() => switchTab(tabsEnum.SPECIAL)}>Specials</button>
          <button onClick={() => switchTab(tabsEnum.DESSERT)}>Desserts</button>
        </div>
        <button onClick={handleSubmit}>Submit Menu</button>
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

const tabsEnum = Object.freeze({
  ROLL: 'rolls',
  APPETIZER: 'appetizers',
  SPECIAL: 'specials',
  DESSERT: 'desserts',
});

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
