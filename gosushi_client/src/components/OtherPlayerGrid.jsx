import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import OtherPlayerTile from './OtherPlayerTile';
import './otherPlayerGrid.scss';

const OtherPlayerGrid = ({ data }) => {

  const displayPlayerData = player => (
    <Col key={player.name}>
      <OtherPlayerTile player={player} />
    </Col>
  );

  let numPerRow = 0;

  if (data.length > 0 && data.length <= 3) {
    numPerRow = data.length;
  } else if (data.length === 4 || data.length === 6) {
    numPerRow = data.length / 2;
  } else if (data.length === 5) {
    numPerRow = 3;
  } else {
    numPerRow = 4;
  }

  return (
    <Container>
      <Row className="other-player-cards" xs={1} sm={2} md={numPerRow} noGutters>
        {data.map(displayPlayerData)}
      </Row>
    </Container>
  );
};

export default OtherPlayerGrid;
