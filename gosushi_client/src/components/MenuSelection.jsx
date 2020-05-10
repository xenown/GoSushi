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

  return isDeciding ? (
    <div className="row mt-3 mb-3 menu-left-pane">
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
      <div className="col-9 menu-right-pane">
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
  ) : null;
};

export default MenuSelection;
