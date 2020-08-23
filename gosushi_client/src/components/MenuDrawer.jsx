import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { menuCardImageMap } from '../utils/menuSelectionUtils';
import './common.scss';
import './menuDrawer.scss';

const MenuDrawer = ({ menu }) => {
  const [show, setShow] = useState(false);
  const handleHide = () => setShow(false);

  const bodyContent = () => {
    return (
      <div className="menu-drawer-body center vertical">
        <img className="menu-card" src={menuCardImageMap['Nigiri']} alt="Nigiri" key="Nigiri" />
        <img
          className="menu-card" 
          src={menuCardImageMap[menu.roll]}
          alt={menu.roll}
          key={menu.roll}
        />
        {menu.appetizers.map(item => (
          <img className="menu-card" src={menuCardImageMap[item]} alt={item} key={item} />
        ))}
        {menu.specials.map(item => (
          <img className="menu-card" src={menuCardImageMap[item]} alt={item} key={item} />
        ))}
        <img
          className="menu-card" 
          src={menuCardImageMap[menu.dessert]}
          alt={menu.dessert}
          key={menu.dessert}
        />
      </div>
    );
  }

  return (
    <div>
    <Button 
      className={"menu-drawer-button" + (show ? " show": "")}
      onClick={() => {setShow(!show)}}>
        {show ? "Close Menu": "Open Menu"}
      </Button>
    <Modal
      show={show}
      onHide={handleHide}
      animation={true}
      keyboard={false}
      className="menu-drawer-modal"
      dialogClassName="menu-drawer-dialog"
    >
      <Modal.Header>
        <Modal.Title>Current Menu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {bodyContent()}
      </Modal.Body>
    </Modal>
    </div>
  );
};

export default MenuDrawer;
